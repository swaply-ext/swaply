import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SwapListComponent, Swap, Profile } from './swap-list.component';
import { SwapService } from '../../services/swap.service';
import { AccountService } from '../../services/account.service';
import { UsersService } from '../../services/users.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('SwapListComponent', () => {
  let component: SwapListComponent;
  let fixture: ComponentFixture<SwapListComponent>;

  // Spies para los servicios (Mocks)
  let swapServiceSpy: jasmine.SpyObj<SwapService>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;

  // Datos Mock (falsos) para las pruebas
  const mockMyProfile: Profile = {
    username: 'miusuario',
    location: 'Madrid',
    profilePhotoUrl: 'assets/me.jpg',
    title: 'Profe',
    imgToTeach: ''
  };

  const mockOtherProfile: Profile = {
    username: 'otrousuario',
    location: 'Barcelona',
    profilePhotoUrl: 'assets/other.jpg',
    title: 'Estudiante',
    imgToTeach: ''
  };

  const mockSwaps: Swap[] = [
    {
      id: 'swap-1',
      requestedUserId: 'user-123',
      skill: 'Guitarra', // Yo enseño
      interest: 'Fútbol', // Yo aprendo
      status: 'STANDBY',
      isRequester: false
    },
    {
      id: 'swap-2',
      requestedUserId: 'user-456',
      skill: 'Cocina',
      interest: 'Inglés',
      status: 'ACCEPTED', // Ya aceptado
      isRequester: true
    }
  ];

  beforeEach(async () => {
    // 1. Crear los Spies
    swapServiceSpy = jasmine.createSpyObj('SwapService', ['getAllSwaps', 'updateSwapStatus']);
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getProfileData']);
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUserById']);

    // 2. Configurar retornos por defecto de los Mocks
    accountServiceSpy.getProfileData.and.returnValue(of(mockMyProfile));
    swapServiceSpy.getAllSwaps.and.returnValue(of(mockSwaps));
    swapServiceSpy.updateSwapStatus.and.returnValue(of({})); // Retorna observable vacío al actualizar
    usersServiceSpy.getUserById.and.returnValue(of(mockOtherProfile));

    await TestBed.configureTestingModule({
      imports: [SwapListComponent], // Importamos el componente Standalone
      providers: [
        provideRouter([]), // Proveemos el router para los routerLink
        { provide: SwapService, useValue: swapServiceSpy },
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SwapListComponent);
    component = fixture.componentInstance;
    // No llamamos a fixture.detectChanges() aquí todavía para poder controlar el primer ciclo
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data correctly on init', () => {
    // Ejecutamos el ciclo de detección de cambios que dispara ngOnInit
    fixture.detectChanges();

    // Verificamos llamadas a servicios
    expect(accountServiceSpy.getProfileData).toHaveBeenCalled();
    expect(swapServiceSpy.getAllSwaps).toHaveBeenCalled();

    // Verificamos que las Signals se han actualizado
    expect(component.currentUser()).toEqual(mockMyProfile);
    expect(component.swaps().length).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should load other users profiles into the map', () => {
    fixture.detectChanges();

    // Debería haber llamado a getUserById para el usuario 'user-123' y 'user-456'
    expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('user-123');
    expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('user-456');

    // Verificar que el mapa tiene datos
    const profile = component.getOtherProfile('user-123');
    expect(profile).toBeDefined();
    expect(profile?.username).toBe('otrousuario');
  });

  describe('Image Logic', () => {
    // Tests para la lógica de asignación de imágenes
    it('should assign correct image for "Fútbol"', () => {
      const swapFutbol = { ...mockSwaps[0], interest: 'Clase de Fútbol sala' };
      const img = component.getImageToLearn(swapFutbol);
      expect(img).toContain('football.jpg');
    });

    it('should assign correct image for "Guitarra"', () => {
      const swapGuitarra = { ...mockSwaps[0], skill: 'Guitarra eléctrica' };
      const img = component.getImageToTeach(swapGuitarra);
      expect(img).toContain('guitar.jpg');
    });

    it('should return default image if no keyword matches', () => {
      const swapRaro = { ...mockSwaps[0], skill: 'Astrofísica Cuántica' };
      // Asumiendo que el default retorna undefined en la lógica interna y luego el fallback en el template o computed
      // En tu código actual retorna undefined la función interna, pero el método público tiene fallback?
      // Revisando tu código: getImageToTeach tiene "|| 'assets/photos_skills/default.jpg'"
      const img = component.getImageToTeach(swapRaro);
      expect(img).toBe('assets/photos_skills/default.jpg');
    });
  });

  describe('User Actions', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Carga inicial
    });

    it('should call accept swap and update local state', () => {
      const swapToAccept = mockSwaps[0]; // Está en STANDBY
      
      component.confirmIntercambio(swapToAccept);

      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('swap-1', 'ACCEPTED');
      
      // Verificar que el estado local cambió a ACCEPTED
      const updatedSwap = component.swaps().find(s => s.id === 'swap-1');
      expect(updatedSwap?.status).toBe('ACCEPTED');
    });

    it('should call deny swap and update local state', () => {
      const swapToDeny = mockSwaps[0];
      
      component.denyIntercambio(swapToDeny);

      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('swap-1', 'DENIED');
      
      // Verificar que el estado local cambió a DENIED
      const updatedSwap = component.swaps().find(s => s.id === 'swap-1');
      expect(updatedSwap?.status).toBe('DENIED');
    });
  });

  describe('HTML Rendering', () => {
    it('should render one card for each swap', () => {
      fixture.detectChanges();
      
      // Buscamos elementos con la clase .interchange-box
      const cards = fixture.debugElement.queryAll(By.css('.interchange-box'));
      // Debería haber 2 tarjetas según nuestro mockSwaps
      expect(cards.length).toBe(2);
    });

    it('should show empty state if no swaps exist', () => {
      // Sobrescribimos el mock para devolver array vacío
      swapServiceSpy.getAllSwaps.and.returnValue(of([]));
      
      // Reiniciamos componente
      component.ngOnInit(); 
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent).toContain('No tienes ningún intercambio');
    });
  });
});