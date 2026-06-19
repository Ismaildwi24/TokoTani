import * as midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
dotenv.config();

const midtrans = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
});

async function main() {
  try {
    const snapToken = await midtrans.createTransaction({
      transaction_details: {
        order_id: `TT-TEST-${Date.now()}`,
        gross_amount: 20000,
      },
      customer_details: {
        first_name: "Test",
        email: "test@example.com",
      },
    });
    console.log("Snap Token:", snapToken);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
