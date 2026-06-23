import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const TYPE_CONFIG = {
  reservation: { color: '#7C3AED', bg: '#7C3AED18', border: '#7C3AED30' },
  review: { color: '#059669', bg: '#05966918', border: '#05966930' },
  info: { color: '#6B7280', bg: '#6B728018', border: '#6B728030' },
};

const SvgCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const SvgStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const SvgInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const SvgBellEmpty = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const SvgCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const SvgDelete = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const TYPE_ICONS = {
  reservation: <SvgCalendar />,
  review: <SvgStar />,
  info: <SvgInfo />,
};

const formatDate = (dateStr, i18n) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return i18n.t('notifications.time_just_now');
  if (mins < 60) return i18n.t('notifications.time_ago_min', { count: mins });
  if (hours < 24) return i18n.t('notifications.time_ago_hour', { count: hours });
  if (days < 7) return i18n.t('notifications.time_ago_day', { count: days });
  return d.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : i18n.language, { day: 'numeric', month: 'short', year: 'numeric' });
};

const getAvatar = (n) => {
  const c = (n.titre || 'N')[0].toUpperCase();
  return c;
};

const getType = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.info;

export default function NotificationsPanel() {
  const { t, i18n } = useTranslation();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.est_lu;
    if (filter === 'read') return n.est_lu;
    return true;
  });

  const countByStatus = (read) => notifications.filter((n) => n.est_lu === read).length;

  const tabs = [
    { key: 'all', label: t('notifications.tab_all'), count: notifications.length },
    { key: 'unread', label: t('notifications.tab_unread'), count: unreadCount },
    { key: 'read', label: t('notifications.tab_read'), count: countByStatus(true) },
  ];

  const handleDeleteAll = async () => {
    try {
      await Promise.all(filtered.map((n) => api.delete(`/notifications/${n.id}`)));
      fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)', fontFamily: 'var(--font-body)' }}>
      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-[10px]">
            <span className="text-lg font-bold text-[var(--color-text)]" style={{ letterSpacing: '-0.2px' }}>
              {t('notifications.title')}
            </span>
            {unreadCount > 0 && (
              <span className="bg-[var(--color-primary)] text-white text-[11px] font-bold rounded-[20px] px-2 min-w-[20px] text-center leading-5">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex gap-[6px]">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}
                className="flex items-center gap-[5px] bg-none border-none rounded-[8px] px-[10px] py-[6px] text-xs font-semibold text-[var(--color-secondary)] cursor-pointer transition-[background] duration-150 hover:bg-[var(--color-secondary)]/10"
                style={{ fontFamily: 'inherit' }}>
                <SvgCheck />
                <span>{t('notifications.mark_all_read')}</span>
              </button>
            )}
            {filtered.length > 0 && (
              <button onClick={handleDeleteAll}
                className="flex items-center gap-[5px] bg-none border-none rounded-[8px] px-[10px] py-[6px] text-xs font-semibold text-[var(--color-error)] cursor-pointer transition-[background] duration-150 hover:bg-[var(--color-error)]/10"
                style={{ fontFamily: 'inherit' }}>
                <SvgDelete />
                <span>{t('notifications.delete_all')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-0 px-5 py-3 border-b border-[var(--color-border)]">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-[6px] bg-none border-none rounded-[10px] px-[14px] py-[7px] text-sm font-medium cursor-pointer transition-all duration-150 ${filter === tab.key ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-muted)]'}`}
              style={{ fontFamily: 'inherit' }}>
              {tab.label}
              <span className={`text-[11px] rounded-[10px] px-[6px] py-px font-semibold ${filter === tab.key ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="max-h-[520px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 gap-2">
              <div className="mb-2 text-[var(--color-text-muted)] opacity-40">
                <SvgBellEmpty />
              </div>
              <p className="text-[15px] font-semibold text-[var(--color-text)] m-0">{t('notifications.empty_title')}</p>
              <p className="text-[13px] text-[var(--color-text-muted)] m-0">{t('notifications.empty_subtitle')}</p>
            </div>
          ) : (
            filtered.map((n) => {
              const tc = getType(n.type);
              return (
                <div key={n.id}
                  className={`flex items-start gap-3 px-5 py-4 border-b border-[var(--color-border)]/50 relative transition-[background] duration-150 ${!n.est_lu ? 'bg-[var(--color-primary)]/[0.02]' : ''}`}
                  style={{ cursor: 'default' }}>
                  {/* Unread dot */}
                  {!n.est_lu && (
                    <span className="absolute top-5 w-[7px] h-[7px] rounded-full bg-[var(--color-secondary)] flex-shrink-0"
                      style={{ [i18n.language === 'ar' ? 'left' : 'right']: '10px' }} />
                  )}

                  {/* Avatar */}
                  <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-[15px] flex-shrink-0"
                    style={{ background: tc.bg, color: tc.color, border: `1.5px solid ${tc.border}` }}>
                    {getAvatar(n)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-[4px] text-[11.5px] font-bold rounded-[6px] px-[8px] py-px"
                        style={{ color: tc.color, background: tc.bg }}>
                        {TYPE_ICONS[n.type] || TYPE_ICONS.info}
                        {n.titre}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">
                        {formatDate(n.date_envoi, i18n)}
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--color-text-secondary)] m-0 leading-[1.55]">
                      {n.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-[4px] flex-shrink-0">
                    {!n.est_lu && (
                      <button onClick={() => markAsRead(n.id)}
                        className="w-[30px] h-[30px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] flex items-center justify-center cursor-pointer transition-all duration-150 hover:text-[var(--color-secondary)] hover:border-[var(--color-secondary)]/30"
                        style={{ fontFamily: 'inherit' }}
                        title={t('notifications.mark_read')}>
                        <SvgCheck />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)}
                      className="w-[30px] h-[30px] rounded-[8px] border border-[#FEE2E2] bg-[#FFF5F5] text-[#DC2626] flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-[#FEE2E2]"
                      style={{ fontFamily: 'inherit' }}
                      title={t('notifications.delete')}>
                      <SvgDelete />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
