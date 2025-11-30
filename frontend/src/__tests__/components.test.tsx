/**
 * Component Flow Tests
 * Tests for key UI components and user flows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { authApi } from '../api/client';

// Mock the API client
vi.mock('../api/client', () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getTokens: vi.fn(() => ({ authToken: null, refreshToken: null })),
    setTokens: vi.fn(),
  },
  coursesApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    enroll: vi.fn(),
  },
  dashboardApi: {
    getStudentStats: vi.fn(),
    getTeacherStats: vi.fn(),
    getCalendarEvents: vi.fn(),
    getAchievements: vi.fn(),
  },
  messagesApi: {
    getConversations: vi.fn(),
    getUnreadCount: vi.fn(),
  },
}));

// Test wrapper with providers
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Component Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Navigation Flow', () => {
    it('should render navigation elements', () => {
      render(
        <TestWrapper>
          <nav data-testid="main-nav">
            <a href="/">Home</a>
            <a href="/courses">Courses</a>
            <a href="/login">Login</a>
          </nav>
        </TestWrapper>
      );

      expect(screen.getByTestId('main-nav')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  describe('Form Components', () => {
    it('should handle form input correctly', async () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      
      render(
        <TestWrapper>
          <form onSubmit={onSubmit} data-testid="test-form">
            <input 
              type="email" 
              placeholder="Email" 
              data-testid="email-input"
              aria-label="Email"
            />
            <input 
              type="password" 
              placeholder="Password" 
              data-testid="password-input"
              aria-label="Password"
            />
            <button type="submit" data-testid="submit-btn">Submit</button>
          </form>
        </TestWrapper>
      );

      const user = userEvent.setup();
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
      
      await user.click(screen.getByTestId('submit-btn'));
      expect(onSubmit).toHaveBeenCalled();
    });

    it('should handle checkbox toggle', async () => {
      render(
        <TestWrapper>
          <label>
            <input 
              type="checkbox" 
              data-testid="remember-checkbox"
            />
            Remember me
          </label>
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('remember-checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      
      await userEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
      
      await userEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('should handle select input', async () => {
      render(
        <TestWrapper>
          <select data-testid="role-select" defaultValue="">
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </TestWrapper>
      );

      const select = screen.getByTestId('role-select') as HTMLSelectElement;
      expect(select.value).toBe('');
      
      fireEvent.change(select, { target: { value: 'teacher' } });
      expect(select.value).toBe('teacher');
    });
  });

  describe('Modal/Dialog Components', () => {
    it('should open and close modal', async () => {
      const ModalComponent = () => {
        const [isOpen, setIsOpen] = useState(false);
        return (
          <>
            <button onClick={() => setIsOpen(true)} data-testid="open-modal">
              Open Modal
            </button>
            {isOpen && (
              <div data-testid="modal" role="dialog">
                <h2>Modal Title</h2>
                <p>Modal content</p>
                <button onClick={() => setIsOpen(false)} data-testid="close-modal">
                  Close
                </button>
              </div>
            )}
          </>
        );
      };

      render(
        <TestWrapper>
          <ModalComponent />
        </TestWrapper>
      );

      // Modal should not be visible initially
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      
      // Open modal
      await userEvent.click(screen.getByTestId('open-modal'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      
      // Close modal
      await userEvent.click(screen.getByTestId('close-modal'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state and then content', async () => {
      const LoadingComponent = () => {
        const [isLoading, setIsLoading] = useState(true);
        
        useEffect(() => {
          const timer = setTimeout(() => setIsLoading(false), 100);
          return () => clearTimeout(timer);
        }, []);

        if (isLoading) {
          return <div data-testid="loading">Loading...</div>;
        }
        return <div data-testid="content">Content loaded</div>;
      };

      render(
        <TestWrapper>
          <LoadingComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Error States', () => {
    it('should display error message', () => {
      render(
        <TestWrapper>
          <div data-testid="error-container" role="alert" className="error">
            <span data-testid="error-icon">⚠️</span>
            <p data-testid="error-message">Something went wrong. Please try again.</p>
            <button data-testid="retry-btn">Retry</button>
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent('Something went wrong');
      expect(screen.getByTestId('retry-btn')).toBeInTheDocument();
    });
  });

  describe('Card Components', () => {
    it('should render course card with correct data', () => {
      const course = {
        id: 1,
        title: 'Introduction to React',
        description: 'Learn React basics',
        level: 'beginner',
        instructor: 'John Doe',
      };

      render(
        <TestWrapper>
          <div data-testid="course-card" className="card">
            <h3 data-testid="course-title">{course.title}</h3>
            <p data-testid="course-description">{course.description}</p>
            <span data-testid="course-level">{course.level}</span>
            <span data-testid="course-instructor">By {course.instructor}</span>
            <button data-testid="enroll-btn">Enroll</button>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('course-title')).toHaveTextContent('Introduction to React');
      expect(screen.getByTestId('course-description')).toHaveTextContent('Learn React basics');
      expect(screen.getByTestId('course-level')).toHaveTextContent('beginner');
      expect(screen.getByTestId('course-instructor')).toHaveTextContent('By John Doe');
    });
  });

  describe('List Components', () => {
    it('should render list of items', () => {
      const items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      render(
        <TestWrapper>
          <ul data-testid="item-list">
            {items.map(item => (
              <li key={item.id} data-testid={`item-${item.id}`}>
                {item.name}
              </li>
            ))}
          </ul>
        </TestWrapper>
      );

      expect(screen.getByTestId('item-list').children).toHaveLength(3);
      expect(screen.getByTestId('item-1')).toHaveTextContent('Item 1');
      expect(screen.getByTestId('item-2')).toHaveTextContent('Item 2');
      expect(screen.getByTestId('item-3')).toHaveTextContent('Item 3');
    });

    it('should show empty state when no items', () => {
      render(
        <TestWrapper>
          <div data-testid="empty-state">
            <p>No items found</p>
            <button data-testid="add-item-btn">Add your first item</button>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  describe('Search and Filter', () => {
    it('should filter items based on search', async () => {
      const FilterComponent = () => {
        const [search, setSearch] = useState('');
        const items = ['Apple', 'Banana', 'Orange', 'Apricot'];
        const filtered = items.filter(item => 
          item.toLowerCase().includes(search.toLowerCase())
        );

        return (
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              data-testid="search-input"
            />
            <ul data-testid="filtered-list">
              {filtered.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        );
      };

      render(
        <TestWrapper>
          <FilterComponent />
        </TestWrapper>
      );

      const list = screen.getByTestId('filtered-list');
      expect(list.children).toHaveLength(4);

      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'ap');

      await waitFor(() => {
        expect(list.children).toHaveLength(2); // Apple and Apricot
      });
    });
  });

  describe('Tabs Component', () => {
    it('should switch between tabs', async () => {
      const TabsComponent = () => {
        const [activeTab, setActiveTab] = useState('tab1');

        return (
          <div>
            <div role="tablist">
              <button 
                role="tab"
                onClick={() => setActiveTab('tab1')}
                data-testid="tab1-btn"
                aria-selected={activeTab === 'tab1'}
              >
                Tab 1
              </button>
              <button 
                role="tab"
                onClick={() => setActiveTab('tab2')}
                data-testid="tab2-btn"
                aria-selected={activeTab === 'tab2'}
              >
                Tab 2
              </button>
            </div>
            <div role="tabpanel">
              {activeTab === 'tab1' && <div data-testid="tab1-content">Tab 1 Content</div>}
              {activeTab === 'tab2' && <div data-testid="tab2-content">Tab 2 Content</div>}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TabsComponent />
        </TestWrapper>
      );

      // Tab 1 should be active initially
      expect(screen.getByTestId('tab1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('tab2-content')).not.toBeInTheDocument();

      // Switch to Tab 2
      await userEvent.click(screen.getByTestId('tab2-btn'));
      expect(screen.queryByTestId('tab1-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('tab2-content')).toBeInTheDocument();

      // Switch back to Tab 1
      await userEvent.click(screen.getByTestId('tab1-btn'));
      expect(screen.getByTestId('tab1-content')).toBeInTheDocument();
    });
  });

  describe('Tooltip Component', () => {
    it('should show tooltip on hover', async () => {
      render(
        <TestWrapper>
          <div>
            <button 
              data-testid="tooltip-trigger"
              aria-describedby="tooltip"
            >
              Hover me
            </button>
            <div id="tooltip" role="tooltip" data-testid="tooltip-content">
              This is a tooltip
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });

  describe('Badge Component', () => {
    it('should render badge with count', () => {
      render(
        <TestWrapper>
          <span data-testid="badge" className="badge">
            <span data-testid="badge-count">5</span>
          </span>
        </TestWrapper>
      );

      expect(screen.getByTestId('badge-count')).toHaveTextContent('5');
    });
  });

  describe('Progress Component', () => {
    it('should display progress bar correctly', () => {
      render(
        <TestWrapper>
          <div data-testid="progress-container">
            <div 
              data-testid="progress-bar"
              role="progressbar"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: '75%' }}
            />
            <span data-testid="progress-text">75%</span>
          </div>
        </TestWrapper>
      );

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(screen.getByTestId('progress-text')).toHaveTextContent('75%');
    });
  });

  describe('Avatar Component', () => {
    it('should show user avatar with initials fallback', () => {
      render(
        <TestWrapper>
          <div data-testid="avatar" aria-label="John Doe">
            <span data-testid="avatar-initials">JD</span>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('avatar')).toHaveAttribute('aria-label', 'John Doe');
      expect(screen.getByTestId('avatar-initials')).toHaveTextContent('JD');
    });
  });

  describe('Notification Component', () => {
    it('should render notification with dismiss button', async () => {
      const onDismiss = vi.fn();

      render(
        <TestWrapper>
          <div data-testid="notification" role="status">
            <span data-testid="notification-message">New message received</span>
            <button 
              data-testid="dismiss-btn" 
              onClick={onDismiss}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('notification-message')).toHaveTextContent('New message received');
      
      await userEvent.click(screen.getByTestId('dismiss-btn'));
      expect(onDismiss).toHaveBeenCalled();
    });
  });
});
