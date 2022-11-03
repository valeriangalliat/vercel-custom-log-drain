import crypto from 'node:crypto'

const key = Buffer.from(process.env.AES_KEY!, 'base64url')

export function encrypt(iv: Buffer, data: Buffer): Buffer {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([cipher.update(data), cipher.final()])
}

export function decrypt(iv: Buffer, encrypted: Buffer): Buffer {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}
