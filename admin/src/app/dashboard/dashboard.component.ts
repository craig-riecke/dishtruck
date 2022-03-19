import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dataSource = [
    { type: 'Warehouse', qty_plastic: 100, qty_metal: 100 },
    { type: 'Food Vendors', qty_plastic: 289, qty_metal: 96 },
    { type: 'Members', qty_plastic: 9, qty_metal: 2 },
    { type: 'Dropoff Points', qty_plastic: 2, qty_metal: 0 },
    { type: 'Shrinkage', qty_plastic: 2, qty_metal: 0 },
  ];

  constructor() {}

  ngOnInit(): void {}
}
