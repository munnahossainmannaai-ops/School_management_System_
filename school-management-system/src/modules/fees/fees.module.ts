import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeStructure, FeeInvoice, FeeInvoiceItem, FeePayment, FeeConcession } from '../../database/entities/fee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeeStructure, FeeInvoice, FeeInvoiceItem, FeePayment, FeeConcession])],
  exports: [],
})
export class FeesModule {}
