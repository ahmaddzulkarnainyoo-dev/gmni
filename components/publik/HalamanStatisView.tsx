/** Kerangka tampilan halaman statis dengan tipografi konten editorial. */
export function HalamanStatisView({
  judul,
  konten,
}: {
  judul: string;
  konten: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <header>
        <h1 className="font-serif text-3xl font-extrabold leading-tight text-hitam-900 md:text-4xl">
          {judul}
        </h1>
        <div aria-hidden className="mt-4 h-1.5 w-16 bg-gmnimerah-500" />
      </header>
      <div
        className="konten-artikel mt-8"
        // Konten dikelola admin/redaksi (blueprint 12); untuk input Markdown
        // editor sudah di-escape oleh lib/markdown sebelum disimpan.
        dangerouslySetInnerHTML={{ __html: konten }}
      />
    </article>
  );
}