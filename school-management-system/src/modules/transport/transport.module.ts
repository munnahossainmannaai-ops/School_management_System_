import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportRoute, Vehicle, Driver, VehicleAssignment, StudentTransport } from '../../database/entities/transport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransportRoute, Vehicle, Driver, VehicleAssignment, StudentTransport])],
  exports: [],
})
export class TransportModule {}
