import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RecoveryDataService } from '../../services/recovery-data.service.service';

@Component({
  selector: 'app-email-sent',
  imports: [
    CommonModule,
    FormsModule
  ],
  standalone: true,
  templateUrl: './email-sent.component.html',
  styleUrl: './email-sent.component.css'
})
export class EmailSentComponent {

}
