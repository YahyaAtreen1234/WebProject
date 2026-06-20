'use client';

import { useState, useEffect } from 'react';

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

interface DeliveryData {
  id: string;
  trackingNumber: string;
  carrier: string;
  shippingMethod: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingHistory: TrackingEvent[];
  order: {
    customerName: string;
    address: string;
    city: string;
  };
}

export default function DeliveryTracking({
  trackingNumber,
}: {
  trackingNumber: string;
}) {
  const [delivery, setDelivery] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/deliveries/tracking?trackingNumber=${trackingNumber}`
        );
        if (!response.ok) throw new Error('Failed to fetch tracking');
        const data = await response.json();
        setDelivery(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching tracking');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchTracking();
      // Refresh every 30 seconds
      const interval = setInterval(fetchTracking, 30000);
      return () => clearInterval(interval);
    }
  }, [trackingNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">⏳</div>
        <span className="ml-2">Tracking package...</span>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-6 text-center">
        <p className="text-rose-300">{error || 'Tracking not found'}</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-500',
    picked: 'bg-blue-500',
    in_transit: 'bg-sapphire-500',
    out_for_delivery: 'bg-gold-500',
    delivered: 'bg-emerald-500',
    failed: 'bg-rose-500',
  };

  const statusSteps = ['pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentStepIndex = Math.max(
    0,
    statusSteps.indexOf(delivery.status)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-midnight-400 mb-1">Tracking Number</p>
            <p className="text-xl font-bold text-white font-mono">
              {delivery.trackingNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-midnight-400 mb-1">Carrier</p>
            <p className="text-lg font-semibold text-sapphire-300">
              {delivery.carrier} • {delivery.shippingMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-8">Delivery Status</h3>

        <div className="space-y-6">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isCompleted
                        ? 'bg-sapphire-500 border-sapphire-400'
                        : 'bg-midnight-700 border-midnight-600'
                    }`}
                  />
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-1 h-12 ${
                        isCompleted ? 'bg-sapphire-500' : 'bg-midnight-600'
                      }`}
                    />
                  )}
                </div>

                {/* Status info */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white capitalize">
                      {step.replace('_', ' ')}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-1 bg-sapphire-500/30 text-sapphire-300 text-xs font-bold rounded">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Show details for current status */}
                  {isCurrent && delivery.trackingHistory.length > 0 && (
                    <div className="mt-3 p-3 bg-midnight-800/50 rounded border border-sapphire-500/20">
                      <p className="text-sm text-midnight-200">
                        {delivery.currentLocation}
                      </p>
                      <p className="text-xs text-midnight-400 mt-1">
                        {new Date(
                          delivery.trackingHistory[0].timestamp
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
          <h4 className="font-bold text-white mb-4">Recipient</h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-midnight-400">Name:</span>
              <span className="ml-2 text-white font-semibold">
                {delivery.order.customerName}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-midnight-400">Address:</span>
              <span className="ml-2 text-white">
                {delivery.order.address}, {delivery.order.city}
              </span>
            </p>
          </div>
        </div>

        <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
          <h4 className="font-bold text-white mb-4">Estimated Delivery</h4>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-sapphire-300">
              {new Date(delivery.estimatedDelivery || '').toLocaleDateString()}
            </p>
            {delivery.actualDelivery && (
              <p className="text-sm text-emerald-300">
                ✓ Delivered on{' '}
                {new Date(delivery.actualDelivery).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tracking History */}
      {delivery.trackingHistory.length > 0 && (
        <div className="card-glass backdrop-blur-md p-6 rounded-2xl">
          <h4 className="font-bold text-white mb-6">Full Tracking History</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {delivery.trackingHistory.map((event) => (
              <div
                key={event.id}
                className="flex gap-4 p-3 bg-midnight-800/30 rounded border border-sapphire-500/10"
              >
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-sapphire-400 mt-2" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white capitalize">
                      {event.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-midnight-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-midnight-300 mt-1">{event.location}</p>
                  {event.description && (
                    <p className="text-xs text-midnight-400 mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
