// routes/payment.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const { pool, gamePool, gamePoolConnect, sql } = require("../db");
const authenticateToken = require("../../middleware/auth");

// ENV-Konstanten (aus .env lesen)
const PAYOP_PUBLIC_KEY = process.env.PAYOP_PUBLIC_KEY;
const PAYOP_SECRET_KEY = process.env.PAYOP_SECRET_KEY;
const PAYOP_MERCHANT_ID = process.env.PAYOP_MERCHANT_ID;
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_HMAC_SECRET = process.env.NOWPAYMENTS_HMAC_SECRET;
const RETURN_URL = "https://deine-domain.com/payment/success";
const CALLBACK_URL_NOW = "https://deine-domain.com/api/payment/nowpayments/callback";
const CALLBACK_URL_PAYOP = "https://deine-domain.com/api/payment/payop/callback";

// Silk buchen (direkt)
async function addSilkDirect(gameAccountId, amount) {
  await gamePoolConnect;
  try {
    const check = await gamePool.request()
      .input("jid", sql.Int, gameAccountId)
      .query("SELECT JID FROM SK_SILK WHERE JID = @jid");

    if (check.recordset.length === 0) {
      await gamePool.request()
        .input("jid", sql.Int, gameAccountId)
        .input("amount", sql.Int, amount)
        .query("INSERT INTO SK_SILK (JID, silk_own, silk_gift, silk_point) VALUES (@jid, @amount, 0, 0)");
    } else {
      await gamePool.request()
        .input("jid", sql.Int, gameAccountId)
        .input("amount", sql.Int, amount)
        .query("UPDATE SK_SILK SET silk_own = silk_own + @amount WHERE JID = @jid");
    }
  } catch (err) {
    console.error("Fehler bei Silk-Gutschrift:", err);
  }
}

// PAYOP: Invoice erzeugen
router.post("/payop/initiate", authenticateToken, async (req, res) => {
  const { accountId, amount } = req.body;

  const order = {
    publicKey: PAYOP_PUBLIC_KEY,
    order: {
      id: `order_${Date.now()}`,
      amount: amount,
      currency: "USD",
      description: `Silk purchase for account ${accountId}`,
      merchantId: PAYOP_MERCHANT_ID
    },
    customer: {
      email: `${accountId}@yourdomain.com`
    },
    resultUrl: RETURN_URL,
    failPath: RETURN_URL,
    callbackUrl: CALLBACK_URL_PAYOP
  };

  try {
    const response = await axios.post("https://payop.com/v1/invoices/create", order, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PAYOP_SECRET_KEY
      }
    });

    res.json({ redirectUrl: `https://payop.com/en/payment/invoice-preprocessing/${response.data.data.invoice.id}` });
  } catch (err) {
    console.error("PayOP error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to create PayOP invoice" });
  }
});

// NOWPayments: Invoice erzeugen
router.post("/nowpayments/initiate", authenticateToken, async (req, res) => {
  const { accountId, amount } = req.body;

  const invoice = {
    price_amount: amount,
    price_currency: "USD",
    pay_currency: "btc",
    order_id: `order_${Date.now()}`,
    order_description: `Silk for game account ${accountId}`,
    ipn_callback_url: CALLBACK_URL_NOW,
    success_url: RETURN_URL
  };

  try {
    const response = await axios.post("https://api.nowpayments.io/v1/invoice", invoice, {
      headers: {
        "x-api-key": NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json"
      }
    });

    return res.json({ redirectUrl: response.data.invoice_url });
  } catch (error) {
    console.error("NOWPayments Error:", error?.response?.data || error.message);
    return res.status(500).json({ error: "NOWPayments Invoice failed" });
  }
});

// NOWPayments: Callback verarbeiten
router.post("/nowpayments/callback", express.json(), async (req, res) => {
  const body = req.body;
  const receivedHmac = req.headers["x-nowpayments-sig"];

  const generatedHmac = crypto
    .createHmac("sha512", NOWPAYMENTS_HMAC_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  if (generatedHmac !== receivedHmac) {
    console.warn("Ungültige HMAC-Signatur von NOWPayments!");
    return res.status(403).send("Invalid signature");
  }

  if (body.payment_status === "finished") {
    const match = body.order_description.match(/game account (\d+)/);
    const accountId = match?.[1];

    if (accountId) {
      const silkAmount = Math.floor(body.price_amount * 60);
      await addSilkDirect(accountId, silkAmount);
    }
  }

  res.send("OK");
});

module.exports = router;
