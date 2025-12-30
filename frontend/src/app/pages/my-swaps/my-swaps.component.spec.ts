import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MySwapsPageComponent } from './my-swaps.component'; // Asegúrate que el nombre del archivo coincida
import { SwapService } from '../../services/swap.service';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import { Swap, Profile } from '../../components/swap-list/swap-list.component';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MySwapsPageComponent', () => {
  let component: MySwapsPageComponent;
  let fixture: ComponentFixture<MySwapsPageComponent>;

  // Spies para servicios y router
  let swapServiceSpy: jasmine.SpyObj<SwapService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // --- Datos Mock ---
  const mockProfile: Profile = {
    username: 'UsuarioTest',
    profilePhotoUrl: 'test.jpg',
    location: 'Test City'
  };

  const mockSwaps: Swap[] = [
    {
      id: '1',
      requestedUserId: 'user1', // Alguien me pide a mí
      skill: 'Code',
      interest: 'Design',
      status: 'STANDBY',
      isRequester: false
    },
    {
      id: '2',
      requestedUserId: 'user2', // Ya aceptado
      skill: 'Cook',
      interest: 'Eat',
      status: 'ACCEPTED',
      isRequester: false
    },
    {
      id: '3',
      requestedUserId: 'user3', // Yo pedí esto (debería filtrarse de pendientes)
      skill: 'Drive',
      interest: 'Fly',
      status: 'STANDBY',
      isRequester: true
    }
  ];

  beforeEach(async () => {
    swapServiceSpy = jasmine.createSpyObj('SwapService', ['getAllSwaps']);
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUserById']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MySwapsPageComponent],
      providers: [
        { provide: SwapService, useValue: swapServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      // Ignoramos componentes hijos como app-navbar o swap-list para testear solo la lógica de la página
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MySwapsPageComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    // Mock inicial para evitar errores en ngOnInit
    swapServiceSpy.getAllSwaps.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Carga de datos (ngOnInit)', () => {
    beforeEach(() => {
      swapServiceSpy.getAllSwaps.and.returnValue(of(mockSwaps));
      usersServiceSpy.getUserById.and.returnValue(of(mockProfile));
    });

    it('debería separar los swaps en Accepted y Pending correctamente', () => {
      fixture.detectChanges(); // Ejecuta ngOnInit

      // 1. Verificar Accepted (ID '2')
      expect(component.acceptedSwaps.length).toBe(1);
      expect(component.acceptedSwaps[0].id).toBe('2');

      // 2. Verificar Pending (Solo ID '1'). El ID '3' debe ser ignorado porque isRequester es true
      expect(component.pendingSwaps.length).toBe(1);
      expect(component.pendingSwaps[0].id).toBe('1');

      expect(component.isLoading).toBeFalse();
    });

    it('debería cargar los perfiles de los usuarios pendientes', () => {
      fixture.detectChanges();

      // Debería llamar al servicio de usuarios con el ID 'user1' (del swap pendiente)
      expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('user1');

      // Debería guardar el perfil en el mapa
      expect(component.pendingProfiles.get('user1')).toEqual(mockProfile);
    });

    it('debería manejar errores del servicio', () => {
      swapServiceSpy.getAllSwaps.and.returnValue(throwError(() => new Error('Error')));
      const consoleSpy = spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse(); // Debe quitar el loading aunque falle
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Lógica del Banner (bannerText)', () => {
    // Helper para configurar estado antes de probar el getter
    const setupBannerState = (swaps: Swap[], profileName: string) => {
      component.pendingSwaps = swaps;
      // Simulamos que el mapa ya tiene los datos
      if (swaps.length > 0) {
        component.pendingProfiles.set(swaps[0].requestedUserId, { ...mockProfile, username: profileName });
      }
    };

    it('debería devolver string vacío si no hay pendientes', () => {
      component.pendingSwaps = [];
      expect(component.bannerText).toBe('');
    });

    it('debería mostrar mensaje singular para 1 solicitud', () => {
      const singleSwap = [mockSwaps[0]]; // 1 elemento
      setupBannerState(singleSwap, 'Juan');

      const text = component.bannerText;
      expect(text).toContain('@Juan');
      expect(text).toContain('solicita un intercambio');
      expect(text).not.toContain('más');
    });

    it('debería mostrar mensaje plural para múltiples solicitudes', () => {
      // Creamos 3 swaps pendientes falsos
      const multipleSwaps = [mockSwaps[0], mockSwaps[0], mockSwaps[0]];
      setupBannerState(multipleSwaps, 'Maria');

      const text = component.bannerText;
      expect(text).toContain('@Maria');
      expect(text).toContain('2 más'); // 3 total - 1 nombre visible = 2 más
    });
  });

  describe('Navegación y Helpers', () => {
    it('getRequesterUser debería devolver el perfil del mapa', () => {
      component.pendingProfiles.set('user1', mockProfile);
      const result = component.getRequesterUser(mockSwaps[0]); // mockSwaps[0] tiene id 'user1'
      expect(result).toEqual(mockProfile);
    });

    it('goToRequests debería navegar a /notifications', () => {
      component.goToRequests();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/notifications']);
    });
  });
});
