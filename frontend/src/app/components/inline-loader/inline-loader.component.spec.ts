import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineLoaderComponent } from './inline-loader.component';

describe('InlineLoaderComponent', () => {
  let component: InlineLoaderComponent;
  let fixture: ComponentFixture<InlineLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InlineLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
