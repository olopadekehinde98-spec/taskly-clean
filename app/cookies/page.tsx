export const metadata = { title: 'Cookie Policy — TasklyClean' }

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-blue-600 mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Cookie Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 31, 2026</p>
      </div>

      {[
        {
          title: 'What Are Cookies',
          body: 'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how you use the service.',
        },
        {
          title: 'Essential Cookies',
          body: 'These cookies are necessary for the Platform to function. They handle authentication, session management, and security features. Without these, you cannot use TasklyClean. These cannot be disabled.',
        },
        {
          title: 'Analytics Cookies',
          body: 'We use analytics cookies to understand how visitors interact with the Platform — which pages are popular, where users drop off, and how features are used. This data is aggregated and anonymous.',
        },
        {
          title: 'Preference Cookies',
          body: 'These cookies remember your settings and preferences, such as theme choices, language, and display options. Disabling these means you may need to re-enter preferences each visit.',
        },
        {
          title: 'Third-Party Cookies',
          body: 'Some of our service providers (payment processors, analytics tools) may set their own cookies. We do not control these cookies — please refer to each provider\'s privacy policy for details.',
        },
        {
          title: 'Managing Cookies',
          body: 'You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies will prevent you from using the Platform.',
        },
      ].map(s => (
        <section key={s.title}>
          <h2 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h2>
          <p className="text-slate-600 leading-7">{s.body}</p>
        </section>
      ))}

      <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
        Cookie questions? Contact <a href="mailto:privacy@tasklyclean.com" className="text-blue-600 hover:underline">privacy@tasklyclean.com</a>
      </div>
    </main>
  )
}
