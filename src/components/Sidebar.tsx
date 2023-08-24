import { useRouter, useSearchParams } from 'next/navigation';
import { PlusIcon } from '@/components/icons/PlusIcon';
import useLocalStorage from '@/hooks/useLocalStorage';
import { storeProject } from '@/actions/chat';
import { v4 as uuidv4 } from 'uuid';
import { ChatIcon } from '@/components/icons/ChatIcon';

export type Project = {
  id: string;
};

export const Sidebar = () => {
  const searchParams = useSearchParams();
  const currentProject = searchParams.get('project');
  const router = useRouter();
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);

  const createNewProject = async () => {
    const uuid = uuidv4();
    await storeProject(uuid);
    setProjects([...projects ?? [], { id: uuid }]);
    router.push(`?project=${uuid}`);
  }

  return (
    <div className="max-w-[230px] w-full bg-white border p-4">
      <button className="bg-teal-600 transition-colors hover:bg-teal-700 rounded-xl px-4 py-3 w-full flex gap-3 items-center shadow-lg shadow-teal-900/10" onClick={createNewProject}>
        <PlusIcon />
        <span>New Project</span>
      </button>
      <div className="mt-6">
        {projects?.map((project) => (
          <button
            key={project.id}
            className={`rounded-xl bg-white hover:bg-slate-50 transition-colors px-4 py-3 w-full flex gap-3 items-center ${project.id === currentProject && 'bg-slate-100'}`}
            onClick={() => router.push(`?project=${project.id}`)}
          >
            <div className="w-2 mr-3">
              <ChatIcon />
            </div>
            <span className="text-gray-900 truncate" key={project.id}>{project.id}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
