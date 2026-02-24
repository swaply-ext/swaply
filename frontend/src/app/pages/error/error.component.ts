import { Component, Input, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorPayload } from '../../models/error-payload.model';
import { ERROR_DEFAULTS } from './error-defaults';

@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() payload: ErrorPayload = { title: '', msg: '' };

  ngOnInit() {

    const routeData = this.route.snapshot.data as ErrorPayload;
    const navigationState = history.state as ErrorPayload;
    if (routeData && routeData.type) {
      this.payload = { ...routeData };
    } else if (navigationState && (navigationState.title || navigationState.type)) {
      this.payload = { ...navigationState };
    }
    this.applyDefaults();
  }

  private applyDefaults() {
    const type = this.payload.type || 'generic';
    const defaults = ERROR_DEFAULTS[type];

    if (!this.payload.title) this.payload.title = defaults.title;
    if (!this.payload.msg) this.payload.msg = defaults.msg;
  }

  backToHome() {
    this.router.navigate(['/']);
  }
}
