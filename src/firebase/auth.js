import { getFirebase, isConfigured } from './config';

export async function signInWithGoogle() {
  const fb = await getFirebase();
  if (!fb) return null;

  const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
  const result = await signInWithPopup(fb.auth, new GoogleAuthProvider());
  return { uid: result.user.uid, name: result.user.displayName || '', email: result.user.email };
}

export async function signInWithEmail(email, password) {
  const fb = await getFirebase();
  if (!fb) return null;

  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const result = await signInWithEmailAndPassword(fb.auth, email, password);
  return { uid: result.user.uid, name: result.user.displayName || email.split('@')[0], email: result.user.email };
}

export async function createAccount(email, password, name) {
  const fb = await getFirebase();
  if (!fb) return null;

  const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
  const result = await createUserWithEmailAndPassword(fb.auth, email, password);
  await updateProfile(result.user, { displayName: name });
  return { uid: result.user.uid, name, email: result.user.email };
}

export async function sendPasswordReset(email) {
  const fb = await getFirebase();
  if (!fb) return false;

  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(fb.auth, email);
  return true;
}

export async function signOutUser() {
  const fb = await getFirebase();
  if (!fb) return;
  const { signOut } = await import('firebase/auth');
  await signOut(fb.auth);
}

export { isConfigured };
