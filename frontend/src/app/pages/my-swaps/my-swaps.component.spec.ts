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


  let swapServiceSpy: jasmine.SpyObj<SwapService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let routerSpy: jasmine.SpyObj<Router>;


  const mockProfile: Profile = {
    username: 'UsuarioTest',
    profilePhotoUrl: 'test.jpg',
    location: 'Test City'
  };

  const mockSwaps: Swap[] = [
    {
      id: '1',
      requestedUserId: 'user1',
      skill: 'Code',
      interest: 'Design',
      status: 'STANDBY',
      isRequester: false
    },
    {
      id: '2',
      requestedUserId: 'user2',
      skill: 'Cook',
      interest: 'Eat',
      status: 'ACCEPTED',
      isRequester: false
    },
    {
      id: '3',
      requestedUserId: 'user3',
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

      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MySwapsPageComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {

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
      fixture.detectChanges();


      expect(component.acceptedSwaps.length).toBe(1);
      expect(component.acceptedSwaps[0].id).toBe('2');


      expect(component.pendingSwaps.length).toBe(1);
      expect(component.pendingSwaps[0].id).toBe('1');

      expect(component.isLoading).toBeFalse();
    });

    it('debería cargar los perfiles de los usuarios pendientes', () => {
      fixture.detectChanges();


      expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('user1');


      expect(component.pendingProfiles.get('user1')).toEqual(mockProfile);
    });

    it('debería manejar errores del servicio', () => {
      swapServiceSpy.getAllSwaps.and.returnValue(throwError(() => new Error('Error')));
      const consoleSpy = spyOn(console, 'error');

      fixture.detectChanges();

      expect(component.isLoading).toBeFalse();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Lógica del Banner (bannerText)', () => {

    const setupBannerState = (swaps: Swap[], profileName: string) => {
      component.pendingSwaps = swaps;

      if (swaps.length > 0) {
        component.pendingProfiles.set(swaps[0].requestedUserId, { ...mockProfile, username: profileName });
      }
    };

    it('debería devolver string vacío si no hay pendientes', () => {
      component.pendingSwaps = [];
      expect(component.bannerText).toBe('');
    });

    it('debería mostrar mensaje singular para 1 solicitud', () => {
      const singleSwap = [mockSwaps[0]];
      setupBannerState(singleSwap, 'Juan');

      const text = component.bannerText;
      expect(text).toContain('@Juan');
      expect(text).toContain('solicita un intercambio');
      expect(text).not.toContain('más');
    });

    it('debería mostrar mensaje plural para múltiples solicitudes', () => {

      const multipleSwaps = [mockSwaps[0], mockSwaps[0], mockSwaps[0]];
      setupBannerState(multipleSwaps, 'Maria');

      const text = component.bannerText;
      expect(text).toContain('@Maria');
      expect(text).toContain('2 más');
    });
  });

  describe('Navegación y Helpers', () => {
    it('getRequesterUser debería devolver el perfil del mapa', () => {
      component.pendingProfiles.set('user1', mockProfile);
      const result = component.getRequesterUser(mockSwaps[0]);
      expect(result).toEqual(mockProfile);
    });

    it('goToRequests debería navegar a /notifications', () => {
      component.goToRequests();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/notifications']);
    });
  });
});
