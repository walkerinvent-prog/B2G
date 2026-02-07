import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const { amount, orderId, studentName, parentEmail } = await req.json();

        if (!amount || !orderId) {
            return Response.json({ error: 'Amount and order ID are required' }, { status: 400 });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                order_id: orderId,
                student_name: studentName,
            },
            receipt_email: parentEmail && parentEmail.trim() ? parentEmail : undefined,
        });

        return Response.json({ 
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Stripe payment error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});