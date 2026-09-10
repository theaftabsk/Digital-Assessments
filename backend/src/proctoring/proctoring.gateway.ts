import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ProctoringGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_exam')
  handleJoinExam(@MessageBody() data: { candidateId: string; referenceId: string }, @ConnectedSocket() client: Socket) {
    client.join(`exam_${data.candidateId}`);
    console.log(`Candidate ${data.candidateId} joined live proctoring stream.`);
    return { status: 'connected' };
  }

  @SubscribeMessage('proctor_violation')
  handleViolation(
    @MessageBody() data: { candidateId: string; eventType: string; details?: string },
    @ConnectedSocket() client: Socket
  ) {
    console.warn(`[ANTI-CHEAT VIOLATION] Candidate ${data.candidateId} triggered ${data.eventType}`);
    this.server.emit('admin_violation_alert', {
      ...data,
      timestamp: new Date().toISOString(),
    });
    return { status: 'flagged' };
  }
}
