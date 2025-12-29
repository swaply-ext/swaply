import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { Client } from '@stomp/stompjs';

describe('ChatService', () => {
  let service: ChatService;
  let mockStompClient: jasmine.SpyObj<Client>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatService]
    });
    service = TestBed.inject(ChatService);

    // 1. Crear el Mock
    mockStompClient = jasmine.createSpyObj('Client', ['activate', 'deactivate', 'publish', 'subscribe']);

    // SOLUCIÓN AL ERROR EN ROJO:
    // Definimos las propiedades como "escribibles" en el objeto mock para evitar el error de read-only
    Object.defineProperty(mockStompClient, 'connected', { value: false, writable: true });
    Object.defineProperty(mockStompClient, 'active', { value: false, writable: true });
    // Inicializamos connectHeaders como objeto vacío para evitar error al intentar leerlo
    Object.defineProperty(mockStompClient, 'connectHeaders', { value: {}, writable: true });

    // 2. Inyectar el Mock en el servicio (usando cast a any para acceder a la propiedad privada)
    (service as any).stompClient = mockStompClient;
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('#connect', () => {
    it('debería configurar las cabeceras y activar el cliente', () => {
      const token = 'fake-jwt-token';
      
      service.connect(token);

      expect(mockStompClient.connectHeaders).toEqual({ Authorization: `Bearer ${token}` });
      expect(mockStompClient.activate).toHaveBeenCalled();
    });

    it('debería actualizar connectionState a true cuando onConnect se ejecuta', (done) => {
      const token = 'fake-jwt-token';
      service.connect(token);

      // Simulamos el callback
      if (mockStompClient.onConnect) {
        mockStompClient.onConnect({} as any);
      }

      service.connectionState$.subscribe(isConnected => {
        if (isConnected) {
          expect(isConnected).toBeTrue();
          done();
        }
      });
    });

    it('debería actualizar connectionState a false cuando ocurre un error', (done) => {
      const token = 'fake-jwt-token';
      service.connect(token);

      if (mockStompClient.onStompError) {
        mockStompClient.onStompError({ 
            headers: { message: 'Error fatal' }, 
            body: 'Detalle' 
        } as any);
      }

      service.connectionState$.subscribe(isConnected => {
        if (!isConnected) {
          expect(isConnected).toBeFalse();
          done();
        }
      });
    });
  });

  describe('#disconnect', () => {
    it('debería llamar a deactivate si el cliente está activo', () => {
      // Forzamos el estado a activo
      (mockStompClient as any).active = true;

      service.disconnect();

      expect(mockStompClient.deactivate).toHaveBeenCalled();
    });

    it('no debería llamar a deactivate si el cliente ya está inactivo', () => {
      (mockStompClient as any).active = false;

      service.disconnect();

      expect(mockStompClient.deactivate).not.toHaveBeenCalled();
    });
  });

  describe('#sendMessage', () => {
    it('debería publicar el mensaje si el cliente está conectado', () => {
      // Forzamos estado conectado
      (mockStompClient as any).connected = true;
      
      const destino = '/app/test';
      const cuerpo = { texto: 'hola' };

      service.sendMessage(destino, cuerpo);

      expect(mockStompClient.publish).toHaveBeenCalledWith({
        destination: destino,
        body: JSON.stringify(cuerpo)
      });
    });

    it('no debería publicar nada si el cliente está desconectado', () => {
      (mockStompClient as any).connected = false;
      
      service.sendMessage('/app/test', {});

      expect(mockStompClient.publish).not.toHaveBeenCalled();
    });
  });

  describe('#subscribeToTopic', () => {
    it('debería retornar error si el cliente no está conectado', (done) => {
      (mockStompClient as any).connected = false;

      service.subscribeToTopic('/topic/test').subscribe({
        error: (err) => {
          expect(err).toBe('Cliente no conectado');
          done();
        }
      });
    });

    it('debería suscribirse y recibir mensajes si está conectado', (done) => {
      (mockStompClient as any).connected = true;
      const mockMessage = { body: '{"mensaje": "exito"}' };

      // Simulamos la suscripción
      mockStompClient.subscribe.and.callFake((topic, callback: any) => {
        callback(mockMessage); 
        return { unsubscribe: () => {} } as any; 
      });

      service.subscribeToTopic('/topic/test').subscribe((data) => {
        expect(data).toEqual({ mensaje: 'exito' });
        expect(mockStompClient.subscribe).toHaveBeenCalled();
        done();
      });
    });
  });
});