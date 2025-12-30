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

  // Spies (Mocks) para los servicios
  let swapServiceSpy: jasmine.SpyObj<SwapService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  // Datos de prueba (Mock Data)
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
      isRequester: false // Este DEBERÍA aparecer
    },
    {
      id: '2',
      requestedUserId: 'user2',
      skill: 'Cocina',
      interest: 'Inglés',
      status: 'ACCEPTED',
      isRequester: false // Este NO debería aparecer (ya aceptado)
    },
    {
      id: '3',
      requestedUserId: 'user3',
      skill: 'Yoga',
      interest: 'Boxeo',
      status: 'STANDBY',
      isRequester: true // Este NO debería aparecer (soy yo quien lo pidió)
    }
  ];

  beforeEach(async () => {
    // Crear mocks de los servicios con los métodos que usa el componente
    swapServiceSpy = jasmine.createSpyObj('SwapService', ['getAllSwaps', 'updateSwapStatus']);
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUserById']);

    await TestBed.configureTestingModule({
      imports: [SwapRequestsComponent], // Componente Standalone va aquí
      providers: [
        provideRouter([]), // Proveer router básico
        { provide: SwapService, useValue: swapServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy }
      ],
      // NO_ERRORS_SCHEMA ignora elementos HTML desconocidos (como app-navbar) para aislar el test
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SwapRequestsComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    // Mock básico para que ngOnInit no falle al crearse
    swapServiceSpy.getAllSwaps.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Carga inicial (ngOnInit)', () => {
    it('debería cargar swaps, filtrar correctamente y cargar perfiles', () => {
      // Configurar respuestas de los mocks
      swapServiceSpy.getAllSwaps.and.returnValue(of(mockSwaps));
      usersServiceSpy.getUserById.and.returnValue(of(mockProfile));

      // Ejecutar ngOnInit
      fixture.detectChanges();

      // 1. Verificar que llamó al servicio de swaps
      expect(swapServiceSpy.getAllSwaps).toHaveBeenCalled();

      // 2. Verificar el filtrado (Solo el ID '1' cumple las condiciones)
      const requests = component.requests();
      expect(requests.length).toBe(1);
      expect(requests[0].id).toBe('1');

      // 3. Verificar que loading se puso en false
      expect(component.loading()).toBeFalse();

      // 4. Verificar que se cargó el perfil del usuario 'user1'
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
    // Configuración previa para tener una lista cargada antes de cada test de acción
    beforeEach(() => {
      swapServiceSpy.getAllSwaps.and.returnValue(of([mockSwaps[0]])); // Solo el ID '1'
      usersServiceSpy.getUserById.and.returnValue(of(mockProfile));
      fixture.detectChanges(); // Inicia el componente y carga la lista
    });

    it('debería aceptar una solicitud (acceptRequest)', () => {
      // Mockear respuesta exitosa del update
      swapServiceSpy.updateSwapStatus.and.returnValue(of(undefined));

      const swapToAccept = mockSwaps[0];
      component.acceptRequest(swapToAccept);

      // 1. Verificar llamada al servicio con el estado correcto
      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('1', 'ACCEPTED');

      // 2. Verificar que se eliminó de la lista local (Signal)
      expect(component.requests().find(s => s.id === '1')).toBeUndefined();
      expect(component.requests().length).toBe(0);
    });

    it('debería rechazar una solicitud (rejectRequest)', () => {
      // Mockear respuesta exitosa del update
      swapServiceSpy.updateSwapStatus.and.returnValue(of(undefined));

      const swapToReject = mockSwaps[0];
      component.rejectRequest(swapToReject);

      // 1. Verificar llamada al servicio con el estado correcto
      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('1', 'DENIED');

      // 2. Verificar que se eliminó de la lista local
      expect(component.requests().length).toBe(0);
    });
  });

  describe('Helpers visuales', () => {
    it('getProfile debería devolver el perfil correcto si existe en el mapa', () => {
      // Inyectamos manualmente un perfil en el mapa para probar
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
