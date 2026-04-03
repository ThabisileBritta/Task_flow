import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TasksClient } from './TasksClient';

async function getUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Cookie: `token=${token.value}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.user;
  } catch {
    return null;
  }
}

export default async function TasksPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-6">
        <TasksClient />
      </main>
    </div>
  );
}
