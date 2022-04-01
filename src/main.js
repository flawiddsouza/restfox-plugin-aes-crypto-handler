import { encryptText, decryptText } from './crypto'
const DEBUG = false

function log(...args) {
    if(DEBUG) {
        console.log('[juego-encryption-handler]', ...args)
    }
}

let JUEGO_ENC

function isInvalidJuegoEnc() {
    let condition = !JUEGO_ENC || typeof JUEGO_ENC !== 'object' || Array.isArray(JUEGO_ENC)

    if(!condition) {
        if('KEY' in JUEGO_ENC === false) {
            return true
        }

        if('IV' in JUEGO_ENC === false) {
            return true
        }
    }

    return condition
}

class URLSearchParams {
    constructor(object) {
        this.params = object
    }

    toString() {
        let string = ''
        const paramKeys = Object.keys(this.params)
        paramKeys.forEach((param, index) => {
            string += `${param}=${this.params[param]}`
            if(index < paramKeys.length - 1) {
                string += '&'
            }
        })
        return string
    }
}

function handleRequest() {
    JUEGO_ENC = context.request.getEnvironmentVariable('JUEGO_ENC')

    if(isInvalidJuegoEnc()) {
        return
    }

    const requestBody = context.request.getBody()

    if(context.request.getMethod() === 'GET') {
        const queryParams = context.request.getQueryParams();
        const queryParamsExtracted = queryParams.filter(item => !item.disabled).map(item => {
            return {
                [item.name]: item.value
            }
        }).reduce(function(acc, x) {
            for (var key in x) acc[key] = x[key];
            return acc
        }, {});

        log('requestBodyExtracted', queryParamsExtracted);

        const encryptedData = encryptText(JSON.stringify(queryParamsExtracted), JUEGO_ENC.KEY, JUEGO_ENC.IV, JUEGO_ENC.ALGO);
        log('encryptedData', encryptedData);

        context.request.setQueryParams([
            {
                name: 'data',
                value: encryptedData
            }
        ]);

        log('requestQueryParamsAfter', context.request.getQueryParams());
    }

    if(context.request.getMethod() === 'POST') {
        const requestBody = context.request.getBody();

        if(requestBody.mimeType === 'application/x-www-form-urlencoded') {
            log('requestBodyBefore', requestBody);

            const requestBodyExtracted = requestBody.params.filter(item => !item.disabled).map(item => {
                return {
                    [item.name]: item.value
                }
            }).reduce(function(acc, x) {
                for (var key in x) acc[key] = x[key];
                return acc
            }, {});
            log('requestBodyExtracted', requestBodyExtracted);

            const encryptedData = encryptText(JSON.stringify(requestBodyExtracted), JUEGO_ENC.KEY, JUEGO_ENC.IV, JUEGO_ENC.ALGO);
            log('encryptedData', encryptedData);

            context.request.setBody({
                mimeType: 'application/x-www-form-urlencoded',
                params: [
                    {
                        name: 'data',
                        value: encryptedData
                    }
                ]
            });

            log('requestBodyAfter', context.request.getBody());
        }
    }
}

function handleResponse() {
    JUEGO_ENC = context.response.getEnvironmentVariable('JUEGO_ENC')

    if(isInvalidJuegoEnc()) {
        return
    }

    const response = JSON.parse(context.response.getBodyText())

    if(typeof response.responseData === 'string') {
        response.responseData = JSON.parse(decryptText(response.responseData, JUEGO_ENC.KEY, JUEGO_ENC.IV, JUEGO_ENC.ALGO))
    }

    context.response.setBodyText(JSON.stringify(response))
}

if('request' in context) {
    handleRequest()
}

if('response' in context) {
    handleResponse()
}
