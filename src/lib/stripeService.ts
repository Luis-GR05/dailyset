// src/lib/stripeService.ts
// Servicio para interactuar con los endpoints de Stripe en DailySet

export interface CheckoutParams {
  planId: 'pro' | 'ultra';
  ciclo: 'mensual' | 'anual';
  userId: string;
  userEmail?: string;
  returnUrl?: string;
}

export async function iniciarCheckoutStripe(params: CheckoutParams): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch('/api/stripe-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar checkout con Stripe');
    }

    if (data.url) {
      window.location.href = data.url;
      return { url: data.url };
    }

    throw new Error('No se recibió la URL de pago de Stripe.');
  } catch (err: any) {
    console.error('Error en iniciarCheckoutStripe:', err);
    return { error: err.message || 'Error de conexión con la pasarela de pago.' };
  }
}

export async function abrirPortalFacturacion(params: {
  customerId?: string;
  userEmail?: string;
  returnUrl?: string;
}): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch('/api/stripe-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al abrir el portal de facturación');
    }

    if (data.url) {
      window.location.href = data.url;
      return { url: data.url };
    }

    throw new Error('No se recibió la URL del portal de Stripe.');
  } catch (err: any) {
    console.error('Error en abrirPortalFacturacion:', err);
    return { error: err.message || 'Error de conexión con el portal de Stripe.' };
  }
}
