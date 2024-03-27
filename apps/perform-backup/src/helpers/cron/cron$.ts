import { Cron } from 'croner';
import { Observable } from 'rxjs';

export function cron$(expression: string) {
  return new Observable<Date>(subscriber => {
    const task = new Cron(expression, () => {
      subscriber.next();
    });

    return () => {
      task.stop();
    };
  });
}
