import { Component, OnInit } from '@angular/core';
import { GQLService } from 'src/app/services/gql.service';
import { IUser } from 'src/types';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  constructor(private gqlService: GQLService) {}
  users: IUser[] = [];

  ngOnInit(): void {
    this.gqlService.getUsers().subscribe((result: any) => {
      const users = (result?.data?.getUsers || []) as IUser[];
      this.users = users;
    });
  }
}
