import {AccountHolder} from '../../../../domain/model/account-holder';
import {AccountHolders} from '../../../../infrastructure/collections';
import BankServiceApi from './bank-service-api';
import BankService from '../../../../domain/services/bank-service';

describe('Bank Service', function () {
  beforeEach(function () {
    this.fromAccountHolder = new AccountHolder({'name': 'accountHolder1', branchNumber: 12345});
    this.toAccountHolder = new AccountHolder({'name': 'accountHolder2', branchNumber: 12345});
    spyOn(AccountHolders, 'findOne').and.returnValues(
       {accountHolder: this.fromAccountHolder},
       {accountHolder: this.toAccountHolder}
    );
  });
  describe('transfer API', function () {
    it('transfers an amount from account A to the account B', function () {
      this.fromAccountHolder.account.balance = 60;
      this.toAccountHolder.account.balance = 80;
      spyOn(Meteor, 'userId').and.returnValue('someUserId');

      var result = Meteor.call('bank/transfer', this.toAccountHolder._id, 20);

      expect(result).toBeFalsy();
      expect(this.fromAccountHolder.account.balance).toBe(40);
      expect(this.toAccountHolder.account.balance).toBe(100);
    });
    it('converts strings to numbers', function () {
      spyOn(BankService.prototype, 'transfer');
      spyOn(Meteor, 'userId').and.returnValue('someUserId');

      Meteor.call('bank/transfer', this.toAccountHolder._id, "20.01");

      expect(BankService.getInstance().transfer.calls.argsFor(0)[2]).toEqual(20.01);
      expect(typeof BankService.getInstance().transfer.calls.argsFor(0)[2]).toEqual('number');
    });
    it('returns an error when the owner is not logged in', function () {
      var result = Meteor.call('bank/transfer');
      expect(result).toEqual({
        message: 'You are not logged in'
      });
    });
  });
  describe('depositCheck API', function () {
    it('should transfer the amount from account A to account B when the check is valid', function () {
      this.fromAccountHolder.account.balance = 50;
      this.fromAccountHolder.account.branchNumber = 12345;
      this.fromAccountHolder.account.numberOfChecks = 10;
      this.toAccountHolder.account.balance = 80;
      this.toAccountHolder.account.branchNumber = 12345;
      spyOn(Meteor, 'userId').and.returnValue('someUserId');

      var result = Meteor.call('bank/depositCheck', this.fromAccountHolder._id, 12345, 10);

      expect(result).toBeFalsy();
      expect(this.fromAccountHolder.account.balance).toBe(40);
      expect(this.toAccountHolder.account.balance).toBe(90);
    });
    it('returns an error when the owner is not logged in', function () {
      var result = Meteor.call('bank/depositCheck');
      expect(result).toEqual({
        message: 'You are not logged in'
      });
    });
  });

});
