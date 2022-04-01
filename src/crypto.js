import CryptoJS from 'crypto-es';

export function encryptText(text, key, iv) {
    let keystring = CryptoJS.SHA256(String(key)).toString(CryptoJS.enc.Hex).substring(0, 32)
    let ivv = CryptoJS.SHA256(String(iv)).toString(CryptoJS.enc.Hex).substring(0, 16)
    const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(keystring), {
        iv: CryptoJS.enc.Utf8.parse(ivv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    })

    return encrypted.toString()
}

export function decryptText(encryptedText, key, iv){
    let keystring = CryptoJS.SHA256(String(key)).toString(CryptoJS.enc.Hex).substring(0, 32)
    let ivv = CryptoJS.SHA256(String(iv)).toString(CryptoJS.enc.Hex).substring(0, 16)

    const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(keystring), {
        iv: CryptoJS.enc.Utf8.parse(ivv),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    })

    return decrypted.toString(CryptoJS.enc.Utf8)
}
