export function PublicPageStub({ eyebrow, title, description }) {
  return (
    <section className="min-h-[80vh] bg-bg-dark px-6 pt-40 pb-24">
      <div className="max-w-[1240px] mx-auto">
        {eyebrow && (
          <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 font-display font-black text-cream text-[56px] md:text-[72px] leading-[0.95] balance">
          {title}
        </h1>
        {description && (
          <p className="mt-6 font-body text-amber-light/85 text-[18px] max-w-[640px] leading-relaxed pretty">
            {description}
          </p>
        )}
        <p className="mt-16 font-body text-cream/40 text-[13px] tracking-widest uppercase">
          — En construcción —
        </p>
      </div>
    </section>
  );
}

export function AdminPageStub({ title, description }) {
  return (
    <section>
      <h1 className="font-display font-black text-cream text-[36px] leading-tight">{title}</h1>
      {description && (
        <p className="mt-3 font-body text-amber-light/80 text-[15px] max-w-[640px]">
          {description}
        </p>
      )}
      <div className="mt-10 p-8 rounded-xl border border-amber/15 bg-amber/5">
        <p className="font-body text-cream/60 text-[13px] tracking-widest uppercase">
          — En construcción —
        </p>
      </div>
    </section>
  );
}
