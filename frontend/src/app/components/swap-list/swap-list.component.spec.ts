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


  let swapServiceSpy: jasmine.SpyObj<SwapService>;
  let accountServiceSpy: jasmine.SpyObj<AccountService>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;


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
      skill: 'Guitarra',
      interest: 'Fútbol',
      status: 'STANDBY',
      isRequester: false
    },
    {
      id: 'swap-2',
      requestedUserId: 'user-456',
      skill: 'Cocina',
      interest: 'Inglés',
      status: 'ACCEPTED',
      isRequester: true
    }
  ];

  beforeEach(async () => {

    swapServiceSpy = jasmine.createSpyObj('SwapService', ['getAllSwaps', 'updateSwapStatus']);
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getProfileData']);
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUserById']);


    accountServiceSpy.getProfileData.and.returnValue(of(mockMyProfile));
    swapServiceSpy.getAllSwaps.and.returnValue(of(mockSwaps));
    swapServiceSpy.updateSwapStatus.and.returnValue(of({}));
    usersServiceSpy.getUserById.and.returnValue(of(mockOtherProfile));

    await TestBed.configureTestingModule({
      imports: [SwapListComponent],
      providers: [
        provideRouter([]),
        { provide: SwapService, useValue: swapServiceSpy },
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SwapListComponent);
    component = fixture.componentInstance;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data correctly on init', () => {

    fixture.detectChanges();


    expect(accountServiceSpy.getProfileData).toHaveBeenCalled();
    expect(swapServiceSpy.getAllSwaps).toHaveBeenCalled();


    expect(component.currentUser()).toEqual(mockMyProfile);
    expect(component.swaps().length).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should load other users profiles into the map', () => {
    fixture.detectChanges();


    expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('user-123');
    expect(usersServiceSpy.getUserById).toHaveBeenCalledWith('user-456');


    const profile = component.getOtherProfile('user-123');
    expect(profile).toBeDefined();
    expect(profile?.username).toBe('otrousuario');
  });

  describe('Image Logic', () => {

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

      const img = component.getImageToTeach(swapRaro);
      expect(img).toBe('assets/photos_skills/default.jpg');
    });
  });

  describe('User Actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call accept swap and update local state', () => {
      const swapToAccept = mockSwaps[0];

      component.confirmIntercambio(swapToAccept);

      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('swap-1', 'ACCEPTED');


      const updatedSwap = component.swaps().find(s => s.id === 'swap-1');
      expect(updatedSwap?.status).toBe('ACCEPTED');
    });

    it('should call deny swap and update local state', () => {
      const swapToDeny = mockSwaps[0];

      component.denyIntercambio(swapToDeny);

      expect(swapServiceSpy.updateSwapStatus).toHaveBeenCalledWith('swap-1', 'DENIED');


      const updatedSwap = component.swaps().find(s => s.id === 'swap-1');
      expect(updatedSwap?.status).toBe('DENIED');
    });
  });

  describe('HTML Rendering', () => {
    it('should render one card for each swap', () => {
      fixture.detectChanges();


      const cards = fixture.debugElement.queryAll(By.css('.interchange-box'));

      expect(cards.length).toBe(2);
    });

    it('should show empty state if no swaps exist', () => {
      swapServiceSpy.getAllSwaps.and.returnValue(of([]));


      component.ngOnInit();
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      expect(emptyState.nativeElement.textContent).toContain('No tienes ningún intercambio');
    });
  });
});
