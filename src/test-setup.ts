import { ngMocks } from 'ng-mocks';

// Alla metoder i mockade tjänster och komponenter blir vi.fn(), så att man
// kan kontrollera anrop med expect(...).toHaveBeenCalledWith(...).
ngMocks.autoSpy('vitest');
