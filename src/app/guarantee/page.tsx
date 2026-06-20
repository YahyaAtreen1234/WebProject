import GuaranteeInfo from '@/src/components/GuaranteeInfo';

export const metadata = {
  title: 'Money-Back Guarantee',
  description: 'Our 100% money-back guarantee',
};

export default function GuaranteePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 via-midnight-800 to-midnight-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GuaranteeInfo />
      </div>
    </div>
  );
}
