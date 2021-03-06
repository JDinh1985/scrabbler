import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import { Player } from './player';
import { PlayerService } from './services/player.service';
import { WordToDelete } from './interfaces/wordToDelete';
import { WordToAdd } from './interfaces/wordToAdd';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
@Injectable({
  providedIn: 'root',
})
export class AppComponent {
  title = 'Scrabbler';
  players: Player[] = [];
  score = 0;
  headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private playerService: PlayerService,
  ) {}

  ngOnInit() {
    this.playerService.getPlayers().subscribe(res => this.players.push(...res), err => console.log(err));
  }

  removeWord(deletedWordFromPlayer: WordToDelete) {
    this.confirmationService.confirm({
      message: `Are you sure that you want to remove "${deletedWordFromPlayer.word.word}"?`,
      accept: () => {
        this.http
          .delete(
            `http://localhost:8086/scrabbler/players/${deletedWordFromPlayer.playerId}/words/${
              deletedWordFromPlayer.word.id
            }`,
          )
          .subscribe(
            (res: Player) => {
              this.players.map(p => {
                p.playerId === res.playerId ? (p.words = res.words) : p;
              });
            },
            err => console.log(err),
          );
      },
    });
  }

  addPlayer(playerName: string) {
    this.playerService.addPlayer(playerName).subscribe(res => {
      (this.players = [...this.players, res]), err => console.log(err);
    });
  }

  playerDeleted(id: number): void {
    const player = this.players.find(player => player.playerId === id);
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${player.playerName}?`,
      accept: () => {
        this.playerService
          .deletePlayer(id)
          .subscribe(
            () => (this.players = this.players.filter(player => player.playerId != id)),
            err => console.log(err),
          );
      },
    });
  }

  addWord(playerWord: WordToAdd) {
    const id: number = playerWord.playerId;
    const word: string = playerWord.word;
    this.playerService.addWordToPlayer(playerWord).subscribe(
      response => {
        const player = this.players.find(player => player.playerId === response.playerId);
        player.words = response.words;
      },
      err => console.log(err),
    );
  }
}
