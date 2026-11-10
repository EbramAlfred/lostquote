import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyIdToken, verifyWebhookHmac, isValidShop, newLinkCode, hashCode } from "../lib/shopify/verify.ts";

const clientId = "abc123", clientSecret = "shhh";
const b64 = (o: object | Buffer) => Buffer.from(Buffer.isBuffer(o) ? o : JSON.stringify(o)).toString("base64url");
function token(claims: Record<string, unknown>, secret = clientSecret, alg = "HS256") {
  const h = b64({ alg, typ: "JWT" }), p = b64(claims);
  return `${h}.${p}.${createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url")}`;
}
const now = Math.floor(Date.now() / 1000);
const good = { iss: "https://demo.myshopify.com/admin", dest: "https://demo.myshopify.com", aud: clientId, sub: "1", exp: now + 60, nbf: now - 5 };
const opts = { clientId, clientSecret };

test("accepts a valid token and returns the shop", () => {
  assert.equal(verifyIdToken(token(good), opts)?.shop, "demo.myshopify.com");
});
test("rejects wrong secret", () => assert.equal(verifyIdToken(token(good, "other"), opts), null));
test("rejects tampered payload", () => {
  const [h, , s] = token(good).split(".");
  assert.equal(verifyIdToken(`${h}.${b64({ ...good, dest: "https://evil.myshopify.com", iss: "https://evil.myshopify.com/admin" })}.${s}`, opts), null);
});
test("rejects expired", () => assert.equal(verifyIdToken(token({ ...good, exp: now - 1 }), opts), null));
test("rejects not-yet-valid", () => assert.equal(verifyIdToken(token({ ...good, nbf: now + 100 }), opts), null));
test("rejects wrong audience", () => assert.equal(verifyIdToken(token({ ...good, aud: "nope" }), opts), null));
test("rejects iss/dest host mismatch", () => assert.equal(verifyIdToken(token({ ...good, iss: "https://other.myshopify.com/admin" }), opts), null));
test("rejects non-shopify dest", () => assert.equal(verifyIdToken(token({ ...good, dest: "https://evil.com", iss: "https://evil.com/admin" }), opts), null));
test("rejects alg none / other algs", () => {
  assert.equal(verifyIdToken(token(good, clientSecret, "none"), opts), null);
  assert.equal(verifyIdToken(`${b64({ alg: "none" })}.${b64(good)}.`, opts), null);
});
test("rejects garbage", () => { assert.equal(verifyIdToken("", opts), null); assert.equal(verifyIdToken("a.b", opts), null); assert.equal(verifyIdToken("a.b.c", opts), null); });

test("webhook hmac", () => {
  const body = '{"shop_domain":"demo.myshopify.com"}';
  const sig = createHmac("sha256", clientSecret).update(body).digest("base64");
  assert.equal(verifyWebhookHmac(body, sig, clientSecret), true);
  assert.equal(verifyWebhookHmac(body + " ", sig, clientSecret), false);
  assert.equal(verifyWebhookHmac(body, null, clientSecret), false);
  assert.equal(verifyWebhookHmac(body, "AAAA", clientSecret), false);
});
test("shop domain check", () => {
  assert.ok(isValidShop("demo-1.myshopify.com"));
  for (const bad of ["evil.com", "demo.myshopify.com.evil.com", "https://demo.myshopify.com", "-x.myshopify.com", "", null, "a b.myshopify.com"]) assert.equal(isValidShop(bad), false, String(bad));
});
test("link codes are unique and hashed", () => {
  const a = newLinkCode(), b = newLinkCode();
  assert.notEqual(a.code, b.code);
  assert.equal(hashCode(a.code), a.hash);
  assert.notEqual(a.code, a.hash);
});
