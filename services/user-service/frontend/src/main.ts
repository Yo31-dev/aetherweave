// Import user management app
import './user-management-app';
import { eventListener } from './services/event-listener.service';

eventListener.emitLog('Web Component registered', 'info');
