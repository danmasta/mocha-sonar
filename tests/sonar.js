describe('Sonar', () => {

    it('should extend base mocha reporter class', () => {
        expect(Sonar.prototype).to.be.an.instanceof(mocha.reporters.Base);
    });

});
