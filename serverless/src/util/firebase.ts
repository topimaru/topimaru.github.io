import * as firebaseAdmin from "firebase-admin";
import * as firestoreAdmin from "firebase-admin/firestore";

const serviceAccount = {
  type: process.env.FIREBASE_type,
  project_id: process.env.FIREBASE_project_id,
  private_key_id: process.env.FIREBASE_private_key_id,
  private_key: process.env.FIREBASE_private_key!.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_client_email,
  client_id: process.env.FIREBASE_client_id,
  auth_uri: process.env.FIREBASE_auth_uri,
  token_uri: process.env.FIREBASE_token_uri,
  auth_provider_x509_cert_url: process.env.FIREBASE_auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.FIREBASE_client_x509_cert_url,
};
export const firebaseApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    serviceAccount as firebaseAdmin.ServiceAccount
  ),
});

export const firestore = firestoreAdmin.getFirestore(firebaseApp);

export type TestClient = {
  accessToken: string;
  refreshToken: string;
};

export async function getTestClient(): Promise<TestClient> {
  const querySnapshot = await firestore
    .collection("/test_client")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  const testClient = querySnapshot.docs?.[0]?.data() as TestClient | undefined;

  if (!testClient) throw Error("Test client does not exist.");

  return testClient;
}

export async function setAccessToken(accessToken: string): Promise<void> {
  const querySnapshot = await firestore
    .collection("/test_client")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  const documentSnapshot = querySnapshot.docs?.[0];

  if (!documentSnapshot) throw Error("Test client does not exist.");
  await documentSnapshot.ref.update({
    accessToken,
  });
}
