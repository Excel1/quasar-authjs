import type { OIDCAuthManager } from '@badisi/auth-js/oidc';
import type { InjectToken } from './models/inject-token.model';

// TODO: add logging
export class OIDCAuthInterceptor {
    #manager: OIDCAuthManager;

    #originalFetch = window.fetch;
    #originalXmlHttpRequestOpen = XMLHttpRequest.prototype.open;
    #originalXmlHttpRequestSend = XMLHttpRequest.prototype.send;
    #xmlHttpRequestSubs = new Map();

    constructor(manager: OIDCAuthManager) {
        this.#manager = manager;
        this.#monkeyPathFetch();
        this.#monkeyPatchXmlHttpRequest();
    }

    // ---- HELPER(s) ----

    #getCompleteUrl(url: string): string {
        try {
            return new URL(url).href;
        } catch {
            return new URL(`${location.origin}${url.startsWith('/') ? '' : '/'}${url}`).href;
        }
    };

    #isMatching(url: string, pattern: string | RegExp | ((url: string) => boolean)): boolean {
        const completeUrl = this.#getCompleteUrl(url);

        if (typeof pattern === 'function') {
            return pattern(completeUrl);
        } else if (typeof pattern === 'string') {
            // Make the pattern regexp friendly
            const match = pattern
                .replace(/\//g, '\\/') // escape / with \/
                .replace(/\./g, '\\.') // escape . with \.
                .replace(/\*\*/g, '*') // replace ** with *
                .replace(/\*/g, '.*'); // replace * with .*

            return (new RegExp(match).exec(completeUrl) !== null);
        } else {
            return (pattern.exec(completeUrl) !== null);
        }
    };

    #isAllowedRequest(url: string, injectToken: InjectToken): boolean {
        let isAllowed = false;
        if (typeof injectToken === 'boolean') {
            isAllowed = injectToken;
        } else {
            const { include, exclude } = injectToken ?? {};

            if (Array.isArray(include)) {
                isAllowed = include.some((pattern: string | RegExp) => this.#isMatching(url, pattern));
            } else if (include) {
                isAllowed = this.#isMatching(url, include);
            }

            if (Array.isArray(exclude)) {
                if (exclude.some((item: string | RegExp) => this.#isMatching(url, item))) {
                    isAllowed = false;
                }
            } else if (exclude && this.#isMatching(url, exclude)) {
                isAllowed = false;
            }
        }
        return isAllowed;
    };

    async #shouldInjectAuthToken(url: string): Promise<boolean> {
        const injectToken = this.#manager.getSettings()?.automaticInjectToken ?? false;
        return (injectToken !== false) && this.#isAllowedRequest(url, injectToken);
    }

    #monkeyPathFetch(enable = true): void {
        if (window.fetch) {
            if (enable) {
                window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
                    // Add token to request headers
                    const url = (input instanceof Request) ? input.url : input.toString();
                    const shouldInjectToken = await this.#shouldInjectAuthToken(url);
                    if (shouldInjectToken) {
                        const accessToken = await this.#manager.getAccessToken();
                        if (accessToken) {
                            init.headers = {
                                'Authorization': `Bearer ${accessToken}`,
                                ...init.headers
                            };
                        }
                    }

                    // Do a login on 401
                    const loginOn401 = this.#manager.getSettings()?.automaticLoginOn401 ?? false;
                    const response = await this.#originalFetch.apply(window, [input, init]);
                    if (loginOn401 && response.status === 401) {
                        await this.#manager.login();
                    }
                    return response;
                };
            } else {
                window.fetch = this.#originalFetch;
            }
        }
    }

    #monkeyPatchXmlHttpRequest(enable = true): void {
        if (XMLHttpRequest.prototype.open && XMLHttpRequest.prototype.send) {
            if (enable) {
                const interceptor = this;

                XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...rest: unknown[]): void {
                    this.url = url;
                    interceptor.#originalXmlHttpRequestOpen.apply(this, [method, url, ...rest]);
                };
                XMLHttpRequest.prototype.send = async function (body?: Document | XMLHttpRequestBodyInit | null): Promise<void> {
                    // Add token to request headers
                    const shouldInjectToken = await interceptor.#shouldInjectAuthToken(this.url);
                    if (shouldInjectToken && this.readyState === XMLHttpRequest.OPENED) {
                        const accessToken = await interceptor.#manager.getAccessToken();
                        if (accessToken) {
                            this.setRequestHeader('Authorization', `Bearer ${accessToken}`);
                        }
                    }

                    // Do a login on 401
                    async function onReadyStateChange() {
                        const loginOn401 = interceptor.#manager.getSettings()?.['automaticLoginOn401'] ?? false;
                        if (loginOn401 && this.readyState === XMLHttpRequest.DONE && this.status === 401) {
                            await interceptor.#manager.login();
                        }
                    }
                    this.addEventListener('readystatechange', onReadyStateChange);
                    interceptor.#xmlHttpRequestSubs.set(this, onReadyStateChange);
                    interceptor.#originalXmlHttpRequestSend.apply(this, [body]);
                };
            } else {
                XMLHttpRequest.prototype.open = this.#originalXmlHttpRequestOpen;
                XMLHttpRequest.prototype.send = this.#originalXmlHttpRequestSend;
                this.#xmlHttpRequestSubs.forEach((listener, xhr) => {
                    xhr.removeEventListener('readystatechange', listener);
                });
                this.#xmlHttpRequestSubs.clear();
            }
        }
    }
}
