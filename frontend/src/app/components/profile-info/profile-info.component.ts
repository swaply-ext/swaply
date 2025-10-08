import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-info',
  imports: [],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css'
})
export class ProfileInfoComponent {
  name = 'Full Name';
  username = '@username';
  location = 'Ubicación';
  description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consequat scelerisque leo, sed dapibus metus tincidunt eget. Ut rhoncus ante vel lorem scelerisque eu. In pretium lobortis velit.';
  avatarUrl = 'assets/avatar.png';
}

