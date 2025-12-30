import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SwapRequestsComponent, Swap, Profile } from './swap-requests.component';
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SwapRequestsComponent', () => {
  let component: SwapRequestsComponent;
  let fixture: ComponentFixture<SwapRequestsComponent>;

  let swapServiceSpy: jasmine.SpyObj<SwapService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  const mockProfile: Profile = {
    username: 'Usuario Test',
    profilePhotoUrl: 'test-url.jpg',
    location: 'Madrid'
  };

  const mockSwaps: Swap[] = [
    {
      id: '1',
      requestedUserId: 'user1',
      skill: 'Guitarra',
      interest: 'Piano',
      status: 'STANDBY',
      isRequester: false
    },
    {
      id: '2',
      requestedUserId: 'user2',
      skill: 'Cocina',
      interest: 'Inglés',
      status: 'ACCEPTED',
      isRequester: false
    },
    {
      id: '3',
      requestedUserId: 'user3',
      skill: 'Yoga',
      interest: 'Boxeo',
      status: 'STANDBY',
      isRequester: true
    }
  ];

  beforeEach(async () => {
    swapServiceSpy = jasmine.createSpyObj('SwapService', ['getAllSwaps', 'updateSwapStatus']);
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUserById']);

    await TestBed.configureTestingModule({
      imports: [SwapRequestsComponent],
      providers: [
        provideRouter([]),
        { provide: SwapService, useValue: swapServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SwapRequestsComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    swapServiceSpy.getAllSwaps.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Carga inicial (ngOnInit)', () => {
    it('debería cargar swaps, filtrar correctamente y cargar perfiles', () => {
      swapServiceSpy.getAllSwaps.and.returnValue(of(mockSwaps));
      usersServiceSpy.getUserById.and.returnValue(of(mockProfile));

      fixture.detectChanges();

      expect(swapServiceSpy.getAllSwaps).toHaveBeenCalled();

      const requests = component.requests();
      expect(requests.length).toBe(1);
      expect(requests[0].id).toBe('1');

      expect(component.loading()).toBeFalse();

      expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('user1');
      expect(component.profilesMap().get('user1')).toEqual(mockProfile);
    });

    it('debería manejar errores al cargar swaps', () => {
      const errorSpy = spyOn(console, 'error');
      swapServiceSpy.getAllSwaps.and.returnValue(throwError(() => new Error('Error de red')));

      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(component.requests().length).toBe(0);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Acciones de usuario', () => {
    beforeEach(() => {
      swapServiceSpy.getAllSwaps.and.returnValue(of([mockSwaps[0]]));
      usersServiceSpy.getUserById.and.returnValue(of(mockProfile));
      fixture.detectChanges();
    });

    it('debería aceptar una solicitud (acceptRequest)', () => {
      swapServiceSpy.updateSwapStatus.and.returnValue(of(undefined));

      const swapToAccept = mockSwaps[0];
      component.acceptRequest(swapToAccept);

      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('1', 'ACCEPTED');

      expect(component.requests().find(s => s.id === '1')).toBeUndefined();
      expect(component.requests().length).toBe(0);
    });

    it('debería rechazar una solicitud (rejectRequest)', () => {
      swapServiceSpy.updateSwapStatus.and.returnValue(of(undefined));

      const swapToReject = mockSwaps[0];
      component.rejectRequest(swapToReject);

      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('1', 'DENIED');

      expect(component.requests().length).toBe(0);
    });
  });

  describe('Helpers visuales', () => {
    it('getProfile debería devolver el perfil correcto si existe en el mapa', () => {
      const map = new Map();
      map.set('user123', mockProfile);
      component.profilesMap.set(map);

      const result = component.getProfile('user123');
      expect(result).toEqual(mockProfile);
    });

    it('getSkillImage debería devolver la imagen por defecto', () => {
      const img = component.getSkillImage('Cualquier cosa');
      expect(img).toContain('assets/photos_skills/default.jpg');
    });
  });
});
