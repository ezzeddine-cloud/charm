'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { authClient } from '@/lib/auth/client';
import { isAdminEmail } from '@/lib/admin-access';
import type { Order } from '@/types';
import { User, Package, MapPin, Sparkles } from 'lucide-react';

type AccountScreen = 'profile' | 'orders' | 'addresses' | 'login' | 'register' | 'forgot' | 'order';

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export const AccountView: React.FC<{ screen?: AccountScreen; orderId?: string }> = ({
  screen = 'profile',
}) => {
  const { navigateTo, showToast } = useStore();
  const tab: 'profile' | 'orders' | 'addresses' =
    screen === 'orders' || screen === 'addresses' ? screen : 'profile';
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [accountOrders, setAccountOrders] = useState<Order[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    setResetToken(token);
  }, [screen]);

  useEffect(() => {
    let cancelled = false;
    authClient
      .getSession({ query: {} })
      .then((result) => {
        if (cancelled) return;
        const user = result.data?.user;
        setSessionUser(user ? { id: user.id, name: user.name, email: user.email } : null);
      })
      .catch(() => {
        if (!cancelled) setSessionUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [screen]);

  useEffect(() => {
    if (!sessionUser) {
      setAccountOrders([]);
      return;
    }
    let cancelled = false;
    fetch('/api/orders')
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setAccountOrders(data as Order[]);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [sessionUser]);

  const refreshSession = async () => {
    const result = await authClient.getSession({ query: {} });
    const user = result.data?.user;
    setSessionUser(user ? { id: user.id, name: user.name, email: user.email } : null);
  };

  const authFailure = (error: unknown, fallback: string) => {
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message;
    }
    return fallback;
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setAuthError('');
    try {
      const result = await authClient.signIn.email({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (result.error) {
        setAuthError(result.error.message || 'Connexion impossible.');
        return;
      }
      await refreshSession();
      const next = new URLSearchParams(window.location.search).get('next');
      if (next?.startsWith('/admin') && isAdminEmail(result.data?.user?.email)) {
        window.location.assign(next);
        return;
      }
      showToast('Vous êtes connectée.', 'success');
      navigateTo('account');
    } catch (error) {
      setAuthError(authFailure(error, 'Connexion impossible.'));
    } finally {
      setPending(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setAuthError('');
    try {
      const result = await authClient.signUp.email({
        email: registerEmail.trim(),
        password: loginPassword,
        name: registerName.trim(),
      });
      if (result.error) {
        setAuthError(result.error.message || 'Inscription impossible.');
        return;
      }
      await refreshSession();
      showToast('Compte créé.', 'success');
      navigateTo('account');
    } catch (error) {
      setAuthError(authFailure(error, 'Inscription impossible.'));
    } finally {
      setPending(false);
    }
  };

  const handleForgot = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setAuthError('');
    try {
      const result = await authClient.requestPasswordReset({
        email: loginEmail.trim(),
        redirectTo: `${window.location.origin}/compte/mot-de-passe`,
      });
      if (result.error) {
        setAuthError(result.error.message || 'Envoi impossible.');
        return;
      }
      showToast('Si ce compte existe, un email de réinitialisation a été envoyé.', 'info');
    } catch (error) {
      setAuthError(authFailure(error, 'Envoi impossible.'));
    } finally {
      setPending(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resetToken) return;
    if (loginPassword.length < 8) {
      setAuthError('Choisissez un mot de passe d’au moins 8 caractères.');
      return;
    }
    setPending(true);
    setAuthError('');
    try {
      const result = await authClient.resetPassword({
        newPassword: loginPassword,
        token: resetToken,
      });
      if (result.error) {
        setAuthError(result.error.message || 'Ce lien n’est plus valable.');
        return;
      }
      showToast('Mot de passe mis à jour. Vous pouvez vous connecter.', 'success');
      window.location.assign('/compte/connexion');
    } catch (error) {
      setAuthError(authFailure(error, 'Ce lien n’est plus valable.'));
    } finally {
      setPending(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({});
    setSessionUser(null);
    setAvatarUrl(null);
    showToast('Session fermée.', 'info');
    navigateTo('account');
  };

  const handleAvatar = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/storage', { method: 'POST', body });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    setUploading(false);
    if (!response.ok || !payload.url) {
      showToast(payload.error || 'La photo n’a pas pu être enregistrée.', 'error');
      return;
    }
    setAvatarUrl(payload.url);
    showToast('Photo enregistrée.', 'success');
  };

  const spent = accountOrders.reduce((sum, order) => sum + order.total, 0);

  if (!authReady) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-sm text-[#8C7A70]">Chargement de la session…</div>
    );
  }

  if (resetToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <form onSubmit={handleResetPassword} className="bg-white p-6 sm:p-8 rounded-xl border border-[#E8DFD5] space-y-4">
          <h1 className="font-serif text-2xl text-[#2C2420]">Nouveau mot de passe</h1>
          <Field label="Nouveau mot de passe" value={loginPassword} onChange={setLoginPassword} type="password" />
          {authError ? <p className="text-xs text-red-700">{authError}</p> : null}
          <button type="submit" disabled={pending} className="w-full py-2.5 bg-[#2C2420] text-white rounded-md text-xs">
            {pending ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
      <div className="border-b border-[#E8DFD5] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#9A7235] font-medium">Espace Cliente</span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#2C2420] mt-1">
            {sessionUser ? `Bonjour, ${sessionUser.name}` : 'Connexion à votre compte'}
          </h1>
        </div>
        {sessionUser ? (
          <button onClick={handleSignOut} className="text-xs text-[#8C7A70] hover:text-[#2C2420] underline">
            Se déconnecter
          </button>
        ) : null}
      </div>

      <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#C69A58]/30 text-xs text-[#615249] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#9A7235] shrink-0" />
        <span>La commande avec paiement à la livraison reste possible sans compte.</span>
      </div>

      {!sessionUser ? (
        <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-xl border border-[#E8DFD5] space-y-6">
          <div className="text-center">
            <h2 className="font-serif text-xl text-[#2C2420]">
              {screen === 'register'
                ? 'Créer un compte'
                : resetToken
                  ? 'Nouveau mot de passe'
                  : screen === 'forgot'
                    ? 'Mot de passe oublié'
                    : 'Connexion'}
            </h2>
          </div>

          {screen === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Nom complet" value={registerName} onChange={setRegisterName} />
              <Field label="Email" value={registerEmail} onChange={setRegisterEmail} type="email" />
              <Field label="Mot de passe" value={loginPassword} onChange={setLoginPassword} type="password" />
              {authError ? <p className="text-xs text-red-700">{authError}</p> : null}
              <button type="submit" disabled={pending} className="w-full py-2.5 bg-[#2C2420] text-white rounded-md text-xs">
                {pending ? 'Création…' : 'Créer le compte'}
              </button>
            </form>
          ) : resetToken ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Field label="Nouveau mot de passe" value={loginPassword} onChange={setLoginPassword} type="password" />
              {authError ? <p className="text-xs text-red-700">{authError}</p> : null}
              <button type="submit" disabled={pending} className="w-full py-2.5 bg-[#2C2420] text-white rounded-md text-xs">
                {pending ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
              </button>
            </form>
          ) : screen === 'forgot' ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <Field label="Email" value={loginEmail} onChange={setLoginEmail} type="email" />
              {authError ? <p className="text-xs text-red-700">{authError}</p> : null}
              <button type="submit" disabled={pending} className="w-full py-2.5 bg-[#2C2420] text-white rounded-md text-xs">
                {pending ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Field label="Email" value={loginEmail} onChange={setLoginEmail} type="email" />
              <Field label="Mot de passe" value={loginPassword} onChange={setLoginPassword} type="password" />
              {authError ? <p className="text-xs text-red-700">{authError}</p> : null}
              <button type="submit" disabled={pending} className="w-full py-2.5 bg-[#2C2420] text-white rounded-md text-xs">
                {pending ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2 text-xs text-center text-[#8C7A70]">
            <Link href="/compte/inscription" className="hover:text-[#9A7235]">
              Créer un compte
            </Link>
            <Link href="/compte/mot-de-passe" className="hover:text-[#9A7235]">
              Mot de passe oublié
            </Link>
            <Link href="/compte/connexion" className="hover:text-[#9A7235]">
              Se connecter
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-1">
            <Link
              href="/compte"
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                tab === 'profile' ? 'bg-[#2C2420] text-[#F5EFEB]' : 'text-[#4A3E39] hover:bg-[#F4EADA]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Mon Profil</span>
            </Link>
            <Link
              href="/compte/commandes"
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                tab === 'orders' ? 'bg-[#2C2420] text-[#F5EFEB]' : 'text-[#4A3E39] hover:bg-[#F4EADA]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Mes Commandes</span>
              </div>
              <span className="text-[11px] opacity-75">{accountOrders.length}</span>
            </Link>
            <Link
              href="/compte/adresses"
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                tab === 'addresses' ? 'bg-[#2C2420] text-[#F5EFEB]' : 'text-[#4A3E39] hover:bg-[#F4EADA]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Carnet d&apos;adresses</span>
            </Link>
          </div>

          <div className="md:col-span-8 bg-[#FAF7F2] p-6 rounded-xl border border-[#E8DFD5] shadow-xs">
            {tab === 'profile' && (
              <div className="space-y-5">
                <h3 className="font-serif text-lg text-[#2C2420]">Informations Personnelles</h3>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover border border-[#E8DFD5]" />
                ) : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <Info label="Nom complet" value={sessionUser.name} />
                  <Info label="Email" value={sessionUser.email} />
                </div>
                <label className="block text-xs text-[#8C7A70]">
                  Photo de profil
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(event) => handleAvatar(event.target.files?.[0])}
                    className="mt-1 block w-full text-xs"
                  />
                </label>
                <div className="pt-4 border-t border-[#E8DFD5] flex items-center justify-between text-xs text-[#8C7A70]">
                  <span>Total commandé avec ce compte :</span>
                  <span className="font-semibold text-[#2C2420] tabular-nums">
                    {spent.toFixed(3)} TND ({accountOrders.length} commandes)
                  </span>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-[#2C2420]">Historique de mes commandes</h3>
                {accountOrders.length === 0 ? (
                  <p className="text-xs text-[#8C7A70] italic">Aucune commande liée à ce compte.</p>
                ) : (
                  <div className="space-y-3">
                    {accountOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-lg bg-[#FAF7F2] border border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-[#2C2420] font-serif">#{order.id}</strong>
                            <span className="text-[#8C7A70]">· {order.createdAt}</span>
                          </div>
                          <p className="text-[#615249] mt-1">
                            {order.items.length} article(s) · {order.total.toFixed(3)} TND (Paiement à la livraison)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F4EADA] text-[#9A7235]">
                            {order.orderStatus === 'delivered' ? 'Livrée' : 'En cours'}
                          </span>
                          <Link
                            href={`/compte/commandes/${order.id}`}
                            className="px-3 py-1 bg-[#2C2420] text-white rounded text-xs hover:bg-[#1A1614]"
                          >
                            Détails
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'addresses' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-serif text-lg text-[#2C2420]">Adresses de livraison enregistrées</h3>
                <p className="text-[#8C7A70]">
                  Les adresses sont saisies à chaque commande. Aucune adresse n&apos;est enregistrée sur le compte pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-[#8C7A70] block mb-1">{label}</label>
      <div className="p-2.5 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md font-medium text-[#2C2420]">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[#4A3E39] block mb-1">{label}</label>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-md text-xs"
      />
    </div>
  );
}

export function AccountOrderDetail({ orderId }: { orderId: string }) {
  const { orders, navigateTo } = useStore();
  const local = orders.find((item) => item.id === orderId);
  const [remote, setRemote] = useState<Order | null>(local ?? null);
  const [checked, setChecked] = useState(Boolean(local));

  useEffect(() => {
    if (local) {
      setRemote(local);
      setChecked(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/orders?reference=${encodeURIComponent(orderId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        setRemote(data && data.id ? (data as Order) : null);
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [local, orderId]);

  if (!checked) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-sm text-[#8C7A70]">Chargement de la commande…</div>;
  }

  if (!remote) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl">Commande introuvable</h1>
        <button onClick={() => navigateTo('account')} className="mt-4 text-sm underline">
          Retour à l&apos;espace cliente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <p className="text-xs uppercase tracking-widest text-[#9A7235]">Commande</p>
      <h1 className="font-serif text-3xl">#{remote.id}</h1>
      <p className="text-sm text-[#8C7A70]">{remote.createdAt}</p>
      <div className="border border-[#E8DFD5] rounded-xl p-5 space-y-2 text-sm">
        {remote.items.map((item) => (
          <div key={`${item.sku}-${item.productName}`} className="flex justify-between gap-4">
            <span>
              {item.productName}
              {item.variantName ? ` · ${item.variantName}` : ''} × {item.quantity}
            </span>
            <span className="tabular-nums">{(item.price * item.quantity).toFixed(3)} TND</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 border-t border-[#E8DFD5] font-medium">
          <span>Total</span>
          <span className="tabular-nums">{remote.total.toFixed(3)} TND</span>
        </div>
        <p>Paiement : espèces à la livraison · {remote.paymentStatus === 'collected' ? 'encaissé' : 'pas encore encaissé'}</p>
        <p>
          Livraison : {remote.customer.fullName}, {remote.customer.city}, {remote.customer.governorate}
        </p>
      </div>
      <button
        onClick={() => navigateTo('track_order', { orderRef: remote.id })}
        className="px-4 py-2 bg-[#2C2420] text-white rounded-md text-xs"
      >
        Voir le suivi
      </button>
    </div>
  );
}
