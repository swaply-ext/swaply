import { Component } from '@angular/core';
import { Router, RouterModule, RouterLink } from '@angular/router';


@Component({
  selector: 'app-side-menu',
  imports: [RouterModule, RouterLink],
  standalone: true,
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css'
})
export class SideMenuComponent {

}
