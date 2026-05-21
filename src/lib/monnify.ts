const BASE_URL =
  "https://sandbox.monnify.com/api/v1";

interface CreateReservedAccountParams {
  email: string;
  name: string;
}

export async function getMonnifyToken() {
  const apiKey =
    process.env.MONNIFY_API_KEY;

  const secretKey =
    process.env.MONNIFY_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error(
      "Monnify API keys are missing"
    );
  }

  const auth = Buffer.from(
    `${apiKey}:${secretKey}`
  ).toString("base64");

  const response = await fetch(
    `${BASE_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        Authorization: `Basic ${auth}`,
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to authenticate with Monnify"
    );
  }

  const data = await response.json();

  const accessToken =
    data?.responseBody?.accessToken;

  if (!accessToken) {
    console.error(data);

    throw new Error(
      "Monnify access token not found"
    );
  }

  return accessToken;
}

export async function createReservedAccount({
  email,
  name,
}: CreateReservedAccountParams) {
  const token =
    await getMonnifyToken();

  const contractCode =
    process.env.MONNIFY_CONTRACT_CODE;

  if (!contractCode) {
    throw new Error(
      "MONNIFY_CONTRACT_CODE is missing"
    );
  }

  const response = await fetch(
    `${BASE_URL}/bank-transfer/reserved-accounts`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        accountReference: `ref_${Date.now()}`,

        accountName: name,

        currencyCode: "NGN",

        contractCode,

        customerEmail: email,

        customerName: name,

        getAllAvailableBanks: true,
      }),

      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data);

    throw new Error(
      data?.responseMessage ||
        "Failed to create reserved account"
    );
  }

 if (!data?.responseBody) {
  console.error(data);

  throw new Error(
    "Invalid Monnify response"
  );
}

return data.responseBody;
}