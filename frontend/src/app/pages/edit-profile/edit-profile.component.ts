import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppNavbarComponent } from "../../components/app-navbar/app-navbar.component";
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { SaveButtonComponent } from '../../components/save-button/save-button.component';

interface User {
  fullName: string;
  username: string;
  about: string;
  birthdate: string;
  location: string;
  gender: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppNavbarComponent,
    SideMenuComponent,
    SaveButtonComponent
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'] 
})
export class EditProfileComponent {
  fullName = "";
  username = "";
  about = "";
  birthdate = "";
  location = "";
  gender = "";
  email = "";
  avatarUrl = 'https://cdn.miiwiki.org/a/a0/WS_Matt.png';

  save() {
    const updatedUser: User = {
      fullName: this.fullName,
      username: this.username,
      about: this.about,
      birthdate: this.birthdate,
      location: this.location,
      gender: this.gender,
      email: this.email
    };
    
    // Simulación de guardado
    console.log('Guardando cambios del usuario:'
      + '\nfullName: ' + this.fullName
      + '\nusername: ' + this.username
      + '\nabout: ' + this.about
      + '\nemail: ' + this.email
      + '\nbirthdate: ' + this.birthdate
      + '\nlocation: ' + this.location
      + '\ngender: ' + this.gender
    );
    // Aquí iría la lógica para enviar los datos al backend
  }

}
