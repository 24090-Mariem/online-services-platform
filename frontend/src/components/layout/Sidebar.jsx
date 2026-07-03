import { useState, memo } from "react";
import { useTranslation } from 'react-i18next';
import { SIDEBAR_CONFIG } from "./sidebarConfig";
import {
  IconDashboard, IconUsers, IconTechnician, IconServices, IconCategories,
  IconReviews, IconReports, IconBell, IconStats, IconSettings, IconProfile,
  IconSystem, IconLogout, IconCalendar, IconHistory, IconMessages,
  IconTracking, IconInvoice, IconChevron
} from '../ui/Icons';

const ICONS = {
  dashboard: <IconDashboard />,
  users: <IconUsers />,
  technician: <IconTechnician />,
  services: <IconServices />,
  categories: <IconCategories />,
  reviews: <IconReviews />,
  reports: <IconReports />,
  bell: <IconBell />,
  stats: <IconStats />,
  settings: <IconSettings />,
  profile: <IconProfile />,
  system: <IconSystem />,
  logout: <IconLogout />,
  calendar: <IconCalendar />,
  history: <IconHistory />,
  messages: <IconMessages />,
  tracking: <IconTracking />,
  invoice: <IconInvoice />,
  chevron: <IconChevron />,
};

const SidebarItem = memo(function SidebarItem({ item, activePage, onNavigate }) {
  const { t } = useTranslation();
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children.some(c => c.key === activePage);
  const isActive = activePage === item.key || isChildActive;
  const [open, setOpen] = useState(isChildActive);

  const handleClick = () => {
    if (hasChildren) {
      setOpen(prev => !prev);
    } else {
      onNavigate(item.path);
    }
  };

  return (
    <>
      {item.divider && <div className="h-px bg-[var(--color-border)] my-3 mx-4" />}

      <button
        className={`flex items-center gap-[11px] py-[10px] px-4 mx-2 rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] text-[var(--text-md)] font-semibold font-body cursor-pointer transition-all duration-[var(--transition-base)] text-left w-[calc(100%-16px)] relative
          hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]
          ${isActive && !hasChildren ? '!bg-[var(--color-primary)]/10 !text-[var(--color-primary)] font-bold' : ''}
          ${item.danger ? '!text-[var(--color-error)]' : ''}
          ${item.danger ? 'hover:!bg-[var(--color-error-bg)] hover:!text-[var(--color-error)]' : ''}`}
        onClick={handleClick}
        title={t(item.label)}
      >
        {isActive && !hasChildren && (
          <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-1 h-3/5 bg-[var(--color-primary)] rounded-r-[var(--radius-sm)]" />
        )}

        <span className="flex items-center justify-center w-5 flex-shrink-0">
          {ICONS[item.icon] || ICONS.dashboard}
        </span>

        <span className="flex-1">{t(item.label)}</span>

        {item.badge > 0 && (
          <span className="ml-auto bg-[var(--color-error)] text-white text-[var(--text-xs)] font-extrabold py-0.5 px-[7px] rounded-full min-w-5 text-center">
            {item.badge}
          </span>
        )}

        {item.status === "online" && (
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)] ml-auto shadow-[0_0_0_2px_rgba(16,185,129,0.25)]" />
        )}

        {hasChildren && (
          <span className={`ml-auto transition-transform duration-[var(--transition-base)] text-[var(--color-text-secondary)] ${open ? 'rotate-180' : ''}`}>
            {ICONS.chevron}
          </span>
        )}
      </button>

      {hasChildren && (
        <div
          className="overflow-hidden transition-[max-height] duration-[var(--transition-base)]"
          style={{ maxHeight: open ? `${item.children.length * 44}px` : "0" }}
        >
          {item.children.map(child => (
            <button
              key={child.key}
              className={`flex items-center gap-2 py-2 px-4 pl-11 mx-2 rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-text-muted)] text-sm font-semibold font-body cursor-pointer transition-all duration-[var(--transition-base)] text-left w-[calc(100%-16px)]
                hover:bg-[var(--color-surface)] hover:text-[var(--color-secondary)]
                ${activePage === child.key ? 'text-[var(--color-secondary)] font-bold' : ''}`}
              onClick={() => onNavigate(child.path || child.key)}
            >
              <span className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                style={{ background: activePage === child.key ? 'var(--color-secondary)' : 'var(--color-border)' }} />
              {t(child.label)}
            </button>
          ))}
        </div>
      )}
    </>
  );
});

const Sidebar = memo(function Sidebar({ role = "admin", activePage = "dashboard", onNavigate, isOpen = false }) {
  const { t } = useTranslation();
  const config = SIDEBAR_CONFIG[role] || SIDEBAR_CONFIG.admin;

  const resolveItem = (item) => {
    if (item.badge === true) {
      return { ...item, badge: 0 };
    }
    return item;
  };

  const renderItems = (items) =>
    items.map((item) => (
      <SidebarItem key={item.key} item={resolveItem(item)} activePage={activePage} onNavigate={onNavigate} />
    ));

  return (
    <aside className="fixed top-[64px] w-[248px] h-[calc(100vh-64px)] bg-[var(--color-background)] border-r border-[var(--color-border)] flex flex-col z-[90] overflow-y-auto pb-4 shadow-[var(--shadow-sm)] transition-[left] duration-[var(--transition-slow)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--color-border)]"
      style={{ left: isOpen ? 0 : -258 }}
    >
      {config.sections.map((section, sIdx) => (
        <div key={sIdx}>
          {section.label && (
            <p className="text-[var(--text-xs)] font-extrabold tracking-[0.08em] uppercase text-[var(--color-text-secondary)] pt-[18px] pb-[6px] px-5">
              {t(section.label)}
            </p>
          )}
          {renderItems(section.items)}
        </div>
      ))}

      {config.bottom && (
        <div className="mt-auto">
          {renderItems(config.bottom)}
        </div>
      )}
    </aside>
  );
});

export default Sidebar;
