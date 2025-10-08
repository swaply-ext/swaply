import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-info',
  imports: [],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoComponent {
  name = 'Full Name';
  username = '@username';
  location = 'Ubicación';
  description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consequat scelerisque leo, sed dapibus metus tincidunt eget. Ut rhoncus ante vel lorem scelerisque eu. In pretium lobortis velit.';
  avatarUrl = 'assets/avatar.png';
}

