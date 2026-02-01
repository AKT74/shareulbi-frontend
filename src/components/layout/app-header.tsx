interface Props {
  title: string;
}

export default function AppHeader({ title }: Props) {
  return (
    <header className="h-16 border-b px-6 flex items-center">
      <h1 className="text-xl font-semibold">{title}</h1>
    </header>
  );
}
