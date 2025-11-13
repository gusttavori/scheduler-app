import { Schema, model, models } from 'mongoose';

// Define a estrutura de um objeto PushSubscription (padrão web)
const PushSubscriptionSchema = new Schema({
  endpoint: { type: String, required: true, unique: true },
  expirationTime: { type: Number, default: null },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
});

// Cria o modelo 'Subscription' (ou usa um existente)
const Subscription = models.Subscription || model('Subscription', PushSubscriptionSchema);

export default Subscription;