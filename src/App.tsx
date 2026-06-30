import { useState, useEffect } from 'react';
import './index.css';

// Типы
type TaskStatus = 'open' | 'in_progress' | 'review' | 'approved' | 'paid';
interface Task {
  id: number;
  title: string;
  description: string;
  price: string;
  status: TaskStatus;
}

// Начальные мок-данные
const initialTasks: Task[] = [
  { id: 1, title: 'Написать статью про ИИ', description: 'Нужна статья на 2000 знаков про применение ИИ.', price: '1500 ₽', status: 'open' },
  { id: 2, title: 'Перевести текст (EN -> RU)', description: 'Перевод инструкции (3 страницы).', price: '800 ₽', status: 'in_progress' },
  { id: 3, title: 'Сделать дизайн логотипа', description: 'Логотип для нового канала.', price: '3000 ₽', status: 'review' },
  { id: 4, title: 'Записать озвучку для видео', description: 'Озвучка ролика 1 минута, мужской голос.', price: '2000 ₽', status: 'approved' },
];

function App() {
  const [role, setRole] = useState<'customer' | 'executor' | 'moderator' | 'accountant'>('customer');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tgUser, setTgUser] = useState<{first_name: string, username?: string, photo_url?: string} | null>(null);

  // Состояние формы создания задачи
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPrice, setNewTaskPrice] = useState('');

  useEffect(() => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setTgUser(tg.initDataUnsafe.user);
      } else {
        // Мок пользователя для локального тестирования
        setTgUser({ first_name: 'Ivan', username: 'ivan_dev' });
      }
    }
  }, []);

  const changeStatus = (id: number, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const createTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskPrice) return;
    
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      description: newTaskDesc,
      price: newTaskPrice + ' ₽',
      status: 'open'
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPrice('');
    alert('Задача успешно создана!');
  };

  const renderStatus = (status: TaskStatus) => {
    const map: Record<TaskStatus, {text: string, class: string}> = {
      open: { text: 'Доступна', class: 'status-open' },
      in_progress: { text: 'В работе', class: 'status-inprogress' },
      review: { text: 'На проверке', class: 'status-review' },
      approved: { text: 'Одобрена (Ждет оплаты)', class: 'status-approved' },
      paid: { text: 'Оплачена', class: 'status-paid' }
    };
    const s = map[status];
    return <span className={`status-tag ${s.class}`}>{s.text}</span>;
  };

  return (
    <div className="app-container">
      <header>
        <h1>Task App</h1>
        {tgUser && (
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{tgUser.first_name}</span>
              {tgUser.username && <span className="user-username">@{tgUser.username}</span>}
            </div>
            {tgUser.photo_url ? (
              <img src={tgUser.photo_url} alt="avatar" className="avatar" />
            ) : (
              <div className="avatar">{tgUser.first_name[0]}</div>
            )}
          </div>
        )}
      </header>

      {/* Переключатель ролей (только для тестирования) */}
      <div className="role-switcher">
        <div className={`role-tab ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>Заказчик</div>
        <div className={`role-tab ${role === 'executor' ? 'active' : ''}`} onClick={() => setRole('executor')}>Исполнитель</div>
        <div className={`role-tab ${role === 'moderator' ? 'active' : ''}`} onClick={() => setRole('moderator')}>Модератор</div>
        <div className={`role-tab ${role === 'accountant' ? 'active' : ''}`} onClick={() => setRole('accountant')}>Бухгалтер</div>
      </div>

      {/* КАБИНЕТ ЗАКАЗЧИКА */}
      {role === 'customer' && (
        <div className="dashboard-customer">
          <div className="glass-panel">
            <h2 style={{ marginBottom: '16px' }}>Создать новую задачу</h2>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label>Название задачи</label>
                <input required className="form-control" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Например: Сделать логотип" />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea className="form-control" value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Подробное описание задачи..." />
              </div>
              <div className="form-group">
                <label>Цена (₽)</label>
                <input required type="number" className="form-control" value={newTaskPrice} onChange={e => setNewTaskPrice(e.target.value)} placeholder="1000" />
              </div>
              <button type="submit" className="btn">Опубликовать задачу</button>
            </form>
          </div>

          <h2 style={{ margin: '24px 0 16px' }}>Мои задачи</h2>
          {tasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ opacity: task.status === 'paid' ? 0.6 : 1 }}>
              {renderStatus(task.status)}
              <h3 className="task-title">{task.title}</h3>
              <div className="task-price">{task.price}</div>
            </div>
          ))}
        </div>
      )}

      {/* КАБИНЕТ ИСПОЛНИТЕЛЯ */}
      {role === 'executor' && (
        <div className="dashboard-executor">
          <h2 style={{ marginBottom: '16px' }}>Задачи в работе</h2>
          {tasks.filter(t => t.status === 'in_progress').map(task => (
            <div key={task.id} className="glass-panel">
              {renderStatus(task.status)}
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description}</p>
              <button className="btn btn-info" onClick={() => changeStatus(task.id, 'review')}>Сдать на проверку</button>
            </div>
          ))}

          <h2 style={{ margin: '24px 0 16px' }}>Доступные задачи</h2>
          {tasks.filter(t => t.status === 'open').map(task => (
            <div key={task.id} className="glass-panel">
              {renderStatus(task.status)}
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description}</p>
              <div className="task-price">{task.price}</div>
              <button className="btn" onClick={() => changeStatus(task.id, 'in_progress')}>Взять в работу</button>
            </div>
          ))}
          {tasks.filter(t => t.status === 'open').length === 0 && (
            <p style={{textAlign: 'center', color: 'var(--tg-theme-hint-color)'}}>Нет доступных задач</p>
          )}
        </div>
      )}

      {/* КАБИНЕТ МОДЕРАТОРА */}
      {role === 'moderator' && (
        <div className="dashboard-moderator">
          <h2 style={{ marginBottom: '16px' }}>Задачи на проверку</h2>
          {tasks.filter(t => t.status === 'review').map(task => (
            <div key={task.id} className="glass-panel">
              {renderStatus(task.status)}
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description}</p>
              <div className="task-price">{task.price}</div>
              <div className="action-buttons">
                <button className="btn btn-success" onClick={() => changeStatus(task.id, 'approved')}>Одобрить</button>
                <button className="btn btn-danger" onClick={() => changeStatus(task.id, 'in_progress')}>На доработку</button>
              </div>
            </div>
          ))}
          {tasks.filter(t => t.status === 'review').length === 0 && (
            <p style={{textAlign: 'center', color: 'var(--tg-theme-hint-color)'}}>Нет задач на проверку</p>
          )}
        </div>
      )}

      {/* КАБИНЕТ БУХГАЛТЕРА */}
      {role === 'accountant' && (
        <div className="dashboard-accountant">
          <h2 style={{ marginBottom: '16px' }}>Задачи к оплате</h2>
          {tasks.filter(t => t.status === 'approved').map(task => (
            <div key={task.id} className="glass-panel">
              {renderStatus(task.status)}
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description}</p>
              <div className="task-price">{task.price}</div>
              <button className="btn btn-success" onClick={() => changeStatus(task.id, 'paid')}>Отметить как оплаченное</button>
            </div>
          ))}
          {tasks.filter(t => t.status === 'approved').length === 0 && (
            <p style={{textAlign: 'center', color: 'var(--tg-theme-hint-color)'}}>Нет задач к оплате</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
