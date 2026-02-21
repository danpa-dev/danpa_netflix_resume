import { onCLS, onINP, onLCP } from 'web-vitals';

type VitalsMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
};

function sendToConsole(metric: VitalsMetric) {
  // Lightweight reporter; replace with POST to your endpoint later
  console.log(`[WebVitals] ${metric.name}: ${metric.value} (${metric.rating})`);
}

export function initWebVitalsReporter(customHandler?: (m: VitalsMetric) => void) {
  const handler = customHandler || sendToConsole;

  onCLS((m) => handler({ name: 'CLS', value: m.value, rating: m.rating as VitalsMetric['rating'] }));
  onINP((m) => handler({ name: 'INP', value: m.value, rating: m.rating as VitalsMetric['rating'] }));
  onLCP((m) => handler({ name: 'LCP', value: m.value, rating: m.rating as VitalsMetric['rating'] }));
}
