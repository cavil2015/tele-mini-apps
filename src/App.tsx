import { useState, useEffect } from 'react';
import './index.css';

// Мок-данные (тестовые данные)
const mockTasks = [
  { id: 1, title: 'Написать статью про ИИ', description: 'Нужна статья на 2000 знаков про применение ИИ в медицине.', price: '1500 ₽', status: 'open' },
  { id: 2, title: 'Перевести текст на английский', description: 'Перевод инструкции пользователя (3 страницы).', price: '800 ₽', status: 'review' },
  { id: 3, title: 'Сделать дизайн логотипа', description: 'Логотип для нового Telegram канала про инвестиции.', price: '3000 ₽', status: 'open' },
];

function App() {
  const [role, setRole] = useState<'executor' | 'moderator'>('executor');
  
  // Для прототипа используем локальный стейт
  const [tasks, setTasks] = useState(mockTasks);

  useEffect(() => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const takeTask = (id: number) => {
    // В прототипе просто убираем задачу из списка "Доступные"
    setTasks(tasks.filter(t => t.id !== id));
    alert('Вы взяли задачу в работу!');
  };

  const approveTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    alert('Задача одобрена и отправлена на оплату!');
  };

  const rejectTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    alert('Задача отправлена на доработку!');
  };

  return (
    <div className="app-container">
      <header>
        <h1>Task App Proto</h1>
        <div style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>v0.1</div>
      </header>

      {/* Переключатель ролей (только для тестирования) */}
      <div className="role-switcher">
        <div 
          className={`role-tab ${role === 'executor' ? 'active' : ''}`}
          onClick={() => setRole('executor')}
        >
          Исполнитель
        </div>
        <div 
          className={`role-tab ${role === 'moderator' ? 'active' : ''}`}
          onClick={() => setRole('moderator')}
        >
          Модератор
        </div>
      </div>

      {/* Дашборд Исполнителя */}
      {role === 'executor' && (
        <div className="dashboard-executor">
          <h2 style={{ marginBottom: '16px' }}>Доступные задачи</h2>
          {tasks.filter(t => t.status === 'open').map(task => (
            <div key={task.id} className="glass-panel">
              <span className="status-tag status-open">Открыта</span>
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description}</p>
              <div className="task-price">{task.price}</div>
              <button className="btn" onClick={() => takeTask(task.id)}>Взять в работу</button>
            </div>
          ))}
          {tasks.filter(t => t.status === 'open').length === 0 && (
            <p style={{textAlign: 'center', color: 'var(--tg-theme-hint-color)'}}>Нет доступных задач</p>
          )}
        </div>
      )}

      {/* Дашборд Модератора */}
      {role === 'moderator' && (
        <div className="dashboard-moderator">
          <h2 style={{ marginBottom: '16px' }}>Задачи на проверку</h2>
          {tasks.filter(t => t.status === 'review').map(task => (
            <div key={task.id} className="glass-panel">
              <span className="status-tag status-review">Ожидает проверки</span>
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">Исполнитель завершил работу. Проверьте результат.</p>
              <div className="task-price">{task.price}</div>
              
              <div className="action-buttons">
                <button className="btn btn-success" onClick={() => approveTask(task.id)}>Одобрить</button>
                <button className="btn btn-danger" onClick={() => rejectTask(task.id)}>Отклонить</button>
              </div>
            </div>
          ))}
          {tasks.filter(t => t.status === 'review').length === 0 && (
            <p style={{textAlign: 'center', color: 'var(--tg-theme-hint-color)'}}>Нет задач на проверку</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
